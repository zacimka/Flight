import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminContacts = ({ user }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get('/api/contact', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setContacts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [user.token]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await axios.patch(`/api/contact/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setContacts(contacts.map(c => c._id === id ? res.data.data : c));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Messages</h1>
      {contacts.length === 0 ? (
        <p>No messages yet</p>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div key={contact._id} className="p-4 border rounded bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-gray-600">{contact.email}</p>
                  <p className="mt-2 text-gray-800">{contact.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(contact.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="ml-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    contact.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {contact.status}
                  </span>
                  {contact.status === 'new' && (
                    <button
                      className="block mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      onClick={() => handleMarkAsRead(contact._id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default AdminContacts;
