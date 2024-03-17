"use client";

const Profile = ({ session, signOut }) => {
  if (!session || !session.user) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p>Profile Container</p>
      <p>Signed in as {session.user.email}</p>
      <p>ID: {session.user.id}</p>
      <p>Name: {session.user.username}</p>
      <p>Role: {session.user.role}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
};

export default Profile;
