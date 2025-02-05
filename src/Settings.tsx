import { Link } from "react-router-dom";

function Settings() {
  return (
    <div>
      <header className="flex items-center mb-3 border-b border-gray-300 pb-2">
        <h1 className="font-bold text-lg">Settings</h1>
        <Link to="/" className="ml-auto p-2 bg-gray-200 rounded hover:bg-gray-300">Back</Link>
      </header>
      <div className="p-4">
        <p>Settings content goes here.</p>
      </div>
    </div>
  );
}

export default Settings;
