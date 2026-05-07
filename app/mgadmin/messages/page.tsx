'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, User, X, MapPin, Zap, Plus } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

interface Message {
  id: string;
  name: string;
  email?: string;
  phone: string;
  city: string;
  kw?: string;
  message?: string;
  date: string;
  read: boolean;
  type?: string;
  lastName?: string;
}



export default function AdminMessagesPage() {
  const router = useRouter();
  const [isEmployee, setIsEmployee] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const employeeData = sessionStorage.getItem('employeeData');
    if (employeeData) {
      setIsEmployee(true);
    }
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const quickLeadResponse = await fetch('/api/quick-lead');
      let formattedLeads: Message[] = [];
      
      if (quickLeadResponse.ok) {
        const leads = await quickLeadResponse.json();
        if (leads.length > 0) {
          formattedLeads = leads.map((lead: Record<string, string>) => ({
            id: lead.id,
            name: lead.name,
            phone: lead.phone || lead.mobile,
            city: lead.city || '',
            kw: lead.kw,
            date: new Date(lead.createdAt).toISOString().split('T')[0],
            read: lead.read,
            type: lead.type,
          }));
        }
      }

      const contactResponse = await fetch('/api/contact');
      let contactMessages: Message[] = [];
      
      if (contactResponse.ok) {
        const contacts = await contactResponse.json();
        if (contacts.length > 0) {
          contactMessages = contacts.map((contact: Record<string, string>) => ({
            id: contact.id,
            name: contact.lastName ? `${contact.name} ${contact.lastName}` : contact.name,
            phone: contact.phone || '',
            city: '',
            message: contact.message,
            date: contact.timestamp ? new Date(contact.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            read: contact.read || false,
            type: 'contact',
          }));
        }
      }

      const allMessages = [...formattedLeads.reverse(), ...contactMessages.reverse()];
      setMessages(allMessages);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
    setLoading(false);
  };

  const handleMarkRead = (id: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, read: true } : msg
      )
    );
  };

  const handleDelete = (id: string) => {
    setMessages(messages.filter((msg) => msg.id !== id));
    setSelectedMessage(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-primary mb-1 lg:mb-2">Contact Messages</h1>
          <p className="text-foreground/70 text-sm lg:text-base">Manage inquiries and quick leads from visitors</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-3 lg:space-y-4 max-h-[400px] lg:max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.map((msg) => (
            <Card
              key={msg.id}
              className={`cursor-pointer border-muted hover:border-accent transition ${
                msg.read ? '' : 'bg-blue-50'
              }`}
              onClick={() => {
                setSelectedMessage(msg);
                handleMarkRead(msg.id);
              }}
            >
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-primary truncate">
                        {msg.name}
                      </p>
                      <p className="text-xs text-foreground/70">{msg.date}</p>
                    </div>
                  </div>
                  {!msg.read && (
                    <div className="ml-6 px-2 py-1 bg-accent text-accent-foreground text-xs rounded w-fit">
                      New
                    </div>
                  )}
                  {msg.type === 'quick-lead' && (
                    <div className="ml-6 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded w-fit">
                      Quick Lead
                    </div>
                  )}
                  {msg.type === 'contact' && (
                    <div className="ml-6 px-2 py-1 bg-green-100 text-green-800 text-xs rounded w-fit">
                      Contact Form
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="border-muted">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg lg:text-xl truncate">
                    {selectedMessage.name}{selectedMessage.lastName && ` ${selectedMessage.lastName}`}
                  </CardTitle>
                  <p className="text-sm text-foreground/70 mt-1">{selectedMessage.date}</p>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-foreground/50 hover:text-foreground ml-2 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4 lg:space-y-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground/70">Phone</p>
                      <p className="font-medium truncate">{selectedMessage.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground/70">City</p>
                      <p className="font-medium truncate">{selectedMessage.city}</p>
                    </div>
                  </div>
                  {selectedMessage.kw && (
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground/70">Solar Capacity</p>
                        <p className="font-medium truncate">{selectedMessage.kw} KW</p>
                      </div>
                    </div>
                  )}
                  {selectedMessage.email && (
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-foreground/70">Email</p>
                        <p className="font-medium truncate">{selectedMessage.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedMessage.message && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-foreground/70 mb-3">Message</p>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-foreground leading-relaxed text-sm lg:text-base">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                  {!isEmployee && (
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition text-sm lg:text-base"
                    >
                      Delete
                    </button>
                  )}
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition text-center text-sm lg:text-base"
                  >
                    📞 Call {selectedMessage.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-muted">
              <CardContent className="flex items-center justify-center py-12 lg:py-16">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
                  <p className="text-foreground/50 text-sm lg:text-base">Select a message to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
