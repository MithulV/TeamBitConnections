import React from 'react'

function UserAddedCard(props) {
  return (
    <>
      <div className="relative w-full max-w-xl bg-white rounded-lg shadow p-6 mx-auto flex gap-6">
        <div className="flex flex-col items-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center space-y-2">
          <p>
            <span className="font-semibold">Name:</span> {props.name}
          </p>
          <p>
            <span className="font-semibold">Event Name:</span> {props.event}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {props.phone}
          </p>
          <p>
            <span className="font-semibold">Role:</span>
            {props.role}
          </p>
        </div>
      </div>
    </>
  );
}

export default UserAddedCard