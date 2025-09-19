import db from "../src/config/db.js";

/**
 * Simplified network analysis controller - focused on essential data
 */
export const analyzeContactNetwork = async (req, res) => {
    try {
        console.log('📊 Starting network analysis...');

        // Fetch complete contact data with referral hierarchy from events
        const contactData = await db`
            SELECT 
                c.contact_id,
                c.name,
                c.email_address,
                c.category,
                c.created_at as contact_created_at,
                e.created_by as event_creator_id,
                creator.email as added_by,
                creator.referred_by as creator_referred_by_email,
                creator.first_name as creator_first_name,
                creator.last_name as creator_last_name,
                creator.profile_picture as creator_profile_picture,
                creator.is_online as creator_is_online,
                referrer.email as creator_referrer_email,
                referrer.referred_by as creator_referrer_referred_by,
                referrer.first_name as referrer_first_name,
                referrer.last_name as referrer_last_name,
                referrer.profile_picture as referrer_profile_picture,
                referrer.is_online as referrer_is_online,
                STRING_AGG(DISTINCT e.event_name, '; ') as events_attended,
                STRING_AGG(DISTINCT e.event_role, '; ') as event_roles,
                STRING_AGG(DISTINCT e.event_location, '; ') as event_locations,
                COUNT(DISTINCT e.event_name) as total_events
            FROM contact c
            LEFT JOIN event e ON c.contact_id = e.contact_id
            LEFT JOIN login creator ON e.created_by = creator.id
            LEFT JOIN login referrer ON creator.referred_by = referrer.email
            WHERE e.created_by IS NOT NULL
            GROUP BY 
                c.contact_id, c.name, c.email_address, c.category, c.created_at,
                e.created_by, creator.email, creator.referred_by, 
                creator.first_name, creator.last_name, creator.profile_picture, creator.is_online,
                referrer.email, referrer.referred_by, referrer.first_name, referrer.last_name, 
                referrer.profile_picture, referrer.is_online
            ORDER BY c.created_at DESC
        `;

        // Also fetch all users for complete network mapping with additional fields
        const allUsers = await db`
            SELECT 
                id,
                email,
                referred_by,
                created_at,
                role,
                first_name,
                last_name,
                profile_picture,
                is_online
            FROM login
            ORDER BY created_at DESC
        `;

        console.log(`📊 Found ${contactData.length} contacts and ${allUsers.length} users`);

        // Build network graph
        const networkGraph = buildNetworkGraph(contactData, allUsers);

        // Calculate network metrics
        const networkMetrics = calculateNetworkMetrics(networkGraph);
        const hierarchyData = createHierarchyVisualization(networkGraph);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            totalContacts: contactData.length,
            totalUsers: allUsers.length,
            networkData: {
                nodes: networkGraph.nodes,
                edges: networkGraph.edges,
                totalNodes: networkGraph.totalNodes,
                totalEdges: networkGraph.totalEdges
            },
            networkMetrics: networkMetrics,
            hierarchyData: hierarchyData,
            topInfluencers: findTopInfluencers(networkGraph),
            referralChains: findReferralChains(networkGraph)
        });

    } catch (error) {
        console.error('❌ Network Analysis Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Build network graph from contact and user data
 */
function buildNetworkGraph(contacts, users) {
    const nodes = new Map();
    const edges = [];

    console.log('🔗 Building network graph...');

    // First, create all user nodes with enhanced data
    users.forEach(user => {
        const userId = `user_${user.email}`;
        if (!nodes.has(userId)) {
            const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
            
            nodes.set(userId, {
                id: userId,
                type: 'user',
                name: fullName,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                profile_picture: user.profile_picture,
                is_online: user.is_online,
                referredBy: user.referred_by,
                connections: 0,
                level: 0,
                contactsAdded: [],
                createdAt: user.created_at,
                role: user.role
            });
        }
    });

    // Create referral edges between users
    users.forEach(user => {
        if (user.referred_by) {
            const userId = `user_${user.email}`;
            const referrerId = `user_${user.referred_by}`;
            
            if (nodes.has(userId) && nodes.has(referrerId)) {
                edges.push({
                    id: `edge_referral_${referrerId}_to_${userId}`,
                    from: referrerId,
                    to: userId,
                    type: 'referral',
                    date: user.created_at
                });

                const referrer = nodes.get(referrerId);
                referrer.connections++;
            }
        }
    });

    // Process contacts with creator information
    contacts.forEach(contact => {
        const contactNode = {
            id: `contact_${contact.contact_id}`,
            type: 'contact',
            name: contact.name,
            email: contact.email_address,
            category: contact.category,
            events: contact.events_attended || '',
            eventRoles: contact.event_roles || '',
            eventLocations: contact.event_locations || '',
            totalEvents: parseInt(contact.total_events) || 0,
            createdAt: contact.contact_created_at,
            addedBy: contact.added_by,
            // Creator information for contact context
            creatorFirstName: contact.creator_first_name,
            creatorLastName: contact.creator_last_name,
            creatorProfilePicture: contact.creator_profile_picture,
            creatorIsOnline: contact.creator_is_online,
            connections: 0,
            level: 0
        };

        nodes.set(contactNode.id, contactNode);

        if (contact.added_by) {
            const creatorId = `user_${contact.added_by}`;
            
            if (nodes.has(creatorId)) {
                const creator = nodes.get(creatorId);
                creator.contactsAdded.push(contactNode);
                creator.connections++;

                edges.push({
                    id: `edge_${creatorId}_to_${contactNode.id}`,
                    from: creatorId,
                    to: contactNode.id,
                    type: 'created_contact',
                    date: contact.contact_created_at
                });
            }
        }
    });

    // Calculate hierarchy levels
    calculateHierarchyLevels(Array.from(nodes.values()), edges);

    return {
        nodes: Array.from(nodes.values()),
        edges: edges,
        totalNodes: nodes.size,
        totalEdges: edges.length
    };
}

/**
 * Calculate hierarchy levels for each node using referral chains
 */
function calculateHierarchyLevels(nodes, edges) {
    console.log('📈 Calculating hierarchy levels...');

    const rootNodes = nodes.filter(node => 
        node.type === 'user' && !node.referredBy
    );

    console.log(`Found ${rootNodes.length} root users`);

    const queue = rootNodes.map(node => ({ node, level: 0 }));
    const visited = new Set();

    while (queue.length > 0) {
        const { node, level } = queue.shift();
        
        if (visited.has(node.id)) continue;
        visited.add(node.id);
        
        node.level = level;

        const outgoingEdges = edges.filter(edge => edge.from === node.id);
        outgoingEdges.forEach(edge => {
            const connectedNode = nodes.find(n => n.id === edge.to);
            if (connectedNode && !visited.has(connectedNode.id)) {
                const nextLevel = edge.type === 'referral' ? level + 1 : level;
                queue.push({ node: connectedNode, level: nextLevel });
            }
        });
    }

    nodes.forEach(node => {
        if (!visited.has(node.id)) {
            node.level = 0;
        }
    });
}

/**
 * Calculate network metrics
 */
function calculateNetworkMetrics(networkGraph) {
    const contacts = networkGraph.nodes.filter(n => n.type === 'contact');
    const users = networkGraph.nodes.filter(n => n.type === 'user');

    return {
        totalNodes: networkGraph.totalNodes,
        totalEdges: networkGraph.totalEdges,
        totalContacts: contacts.length,
        totalUsers: users.length,
        averageConnectionsPerUser: users.length > 0 ? 
            users.reduce((sum, user) => sum + user.connections, 0) / users.length : 0,
        networkDensity: networkGraph.totalEdges / Math.max((networkGraph.totalNodes * (networkGraph.totalNodes - 1)) / 2, 1),
        maxLevel: networkGraph.nodes.length > 0 ? Math.max(...networkGraph.nodes.map(n => n.level)) : 0
    };
}

/**
 * Create hierarchy visualization data
 */
function createHierarchyVisualization(networkGraph) {
    console.log('📊 Creating hierarchy visualization...');
    
    const levels = {};
    networkGraph.nodes.forEach(node => {
        const level = node.level || 0;
        if (!levels[level]) levels[level] = [];
        levels[level].push(node);
    });

    return {
        levels,
        maxLevel: Object.keys(levels).length > 0 ? Math.max(...Object.keys(levels).map(Number)) : 0,
        totalLevels: Object.keys(levels).length,
        visualizationData: networkGraph.nodes.map(node => ({
            id: node.id,
            name: node.name,
            type: node.type,
            level: node.level,
            connections: node.connections,
            first_name: node.first_name,
            last_name: node.last_name,
            profile_picture: node.profile_picture,
            is_online: node.is_online
        }))
    };
}

/**
 * Find top influencers
 */
function findTopInfluencers(networkGraph) {
    return networkGraph.nodes
        .filter(node => node.type === 'user' && node.connections > 0)
        .sort((a, b) => b.connections - a.connections)
        .slice(0, 5)
        .map(node => ({
            name: node.name,
            email: node.email,
            first_name: node.first_name,
            last_name: node.last_name,
            profile_picture: node.profile_picture,
            is_online: node.is_online,
            type: node.type,
            connections: node.connections,
            level: node.level,
            influence_score: calculateInfluenceScore(node, networkGraph)
        }));
}

/**
 * Calculate influence score
 */
function calculateInfluenceScore(node, networkGraph) {
    let score = node.connections;
    score += Math.max(5 - node.level, 0) * 2;
    score += calculateNetworkReach(node, networkGraph) * 0.5;
    return Math.round(score * 10) / 10;
}

/**
 * Calculate total network reach for a node
 */
function calculateNetworkReach(node, networkGraph) {
    let reach = node.connections;
    const referredUsers = networkGraph.nodes.filter(n => n.referredBy === node.email);
    referredUsers.forEach(referredUser => {
        reach += referredUser.connections || 0;
    });
    return reach;
}

/**
 * Find referral chains
 */
function findReferralChains(networkGraph) {
    return findAllReferralChains(networkGraph)
        .slice(0, 10)
        .map(chain => ({
            length: chain.length,
            chain: chain.map(node => ({
                name: node.name,
                email: node.email,
                first_name: node.first_name,
                last_name: node.last_name,
                profile_picture: node.profile_picture,
                is_online: node.is_online,
                type: node.type,
                level: node.level
            }))
        }));
}

/**
 * Find all referral chains in the network
 */
function findAllReferralChains(networkGraph) {
    const chains = [];
    const visited = new Set();

    networkGraph.nodes
        .filter(node => node.type === 'user')
        .forEach(user => {
            if (!visited.has(user.id)) {
                const chain = buildReferralChain(user, networkGraph, []);
                if (chain.length > 1) {
                    chains.push(chain);
                    chain.forEach(node => visited.add(node.id));
                }
            }
        });

    return chains;
}

/**
 * Build referral chain recursively
 */
function buildReferralChain(node, networkGraph, currentChain) {
    if (currentChain.some(n => n.id === node.id)) return currentChain;
    
    const newChain = [...currentChain, node];
    
    if (node.referredBy) {
        const referrer = networkGraph.nodes.find(n => n.email === node.referredBy);
        if (referrer) {
            return buildReferralChain(referrer, networkGraph, newChain);
        }
    }
    
    return newChain;
}
