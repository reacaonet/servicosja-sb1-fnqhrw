import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Send, User, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: any;
}

interface ChatUser {
  id: string;
  name: string;
  imageUrl?: string;
  lastMessage?: string;
  timestamp?: any;
}

const Messages: React.FC = () => {
  const { currentUser } = useAuth();
  const { professionalId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchChatUsers = async () => {
      try {
        const messagesRef = collection(db, 'messages');
        const sentQuery = query(messagesRef, where('senderId', '==', currentUser.uid));
        const receivedQuery = query(messagesRef, where('receiverId', '==', currentUser.uid));

        const [sentSnapshot, receivedSnapshot] = await Promise.all([
          getDocs(sentQuery),
          getDocs(receivedQuery)
        ]);

        const userIds = new Set<string>();
        
        sentSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.receiverId) userIds.add(data.receiverId);
        });
        
        receivedSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.senderId) userIds.add(data.senderId);
        });

        const usersPromises = Array.from(userIds).map(async (userId) => {
          try {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                id: userId,
                name: userData.name || 'Usuário',
                imageUrl: userData.imageUrl || '',
              };
            }
            return null;
          } catch (error) {
            console.error('Error fetching user:', error);
            return null;
          }
        });

        const usersData = (await Promise.all(usersPromises)).filter((user): user is ChatUser => user !== null);
        setChatUsers(usersData);
      } catch (error) {
        console.error('Error fetching chat users:', error);
      }
    };

    fetchChatUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.uid || !professionalId) return;

    const loadSelectedUser = async () => {
      try {
        const userDocRef = doc(db, 'users', professionalId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setSelectedUser({
            id: professionalId,
            name: userData.name || 'Usuário',
            imageUrl: userData.imageUrl || '',
          });
        }
      } catch (error) {
        console.error('Error loading selected user:', error);
      }
    };

    loadSelectedUser();

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('senderId', 'in', [currentUser.uid, professionalId]),
      where('receiverId', 'in', [currentUser.uid, professionalId]),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      setMessages(messagesData);
      scrollToBottom();
    }, (error) => {
      console.error('Error in messages snapshot:', error);
    });

    return () => unsubscribe();
  }, [currentUser, professionalId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser?.uid || !professionalId) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage.trim(),
        senderId: currentUser.uid,
        receiverId: professionalId,
        timestamp: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (userId: string) => {
    if (userId) {
      navigate(`/principal/messages/${userId}`);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Você precisa estar logado para acessar as mensagens.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)]">
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Conversas</h2>
        </div>
        <div className="overflow-y-auto h-full">
          {chatUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhuma conversa encontrada
            </div>
          ) : (
            chatUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user.id)}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer ${
                  user.id === professionalId ? 'bg-blue-50' : ''
                }`}
              >
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  {user.lastMessage && (
                    <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="bg-white border-b p-4">
              <div className="flex items-center gap-3">
                {selectedUser.imageUrl ? (
                  <img
                    src={selectedUser.imageUrl}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold">{selectedUser.name}</h2>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  Nenhuma mensagem ainda. Comece uma conversa!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === currentUser?.uid
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      <p>{message.text}</p>
                      {message.timestamp && (
                        <span className="text-xs opacity-70">
                          {message.timestamp.toDate().toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t p-4 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Selecione uma conversa para começar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;