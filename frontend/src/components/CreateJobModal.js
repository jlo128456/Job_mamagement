export default function CreateJobModal() {
  return (
    <div className="modal">
      <h2>Create Job</h2>
      <form>
        <input type="text" placeholder="Job Title" />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}