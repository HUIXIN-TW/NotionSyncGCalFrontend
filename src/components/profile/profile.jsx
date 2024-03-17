import styles from "./profile.module.css";
import Button from "@components/button/Button";

const Profile = ({ session, signOut }) => {
  if (!session || !session.user) {
    return <div>Loading...</div>;
  }

  const { email, id, username, role } = session.user;

  return (
    <div className={styles.profile_container}>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>Email:</span> {email}
      </div>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>ID:</span> {id}
      </div>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>Name:</span> {username}
      </div>
      <div className={styles.profile_detail}>
        <span className={styles.profile_label}>Role:</span> {role}
      </div>
      <Button text="Sign Out" onClick={() => signOut()} />
    </div>
  );
};

export default Profile;
