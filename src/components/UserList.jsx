import React, { useState, useEffect } from 'react';
import { user_routes } from '../api/userRoutes';
//test component to print out the message to see if it works
function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    
    user_routes.getAllUsers()
      .then(data => setUsers(data))
      .catch(err => console.log("Clash royale GRRRR!!!!:", err));
  }, []);

  return (
    <div>
      <h2>Test:</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.username} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}
export default UserList