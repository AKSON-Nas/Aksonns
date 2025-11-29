import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { HeadphonesIcon, Plus, MessageCircle, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SupportPage() {
  const { user } = useContext(AppContext);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: ''
  });
  
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API}/support/tickets`);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      await axios.post(`${API}/support/tickets`, newTicket);
      toast.success('Ticket criado! Responderemos em breve.');
      setShowNewTicketDialog(false);
      setNewTicket({ subject: '', message: '' });
      fetchTickets();
    } catch (error) {
      toast.error('Erro ao criar ticket');
      console.error(error);
    }
  };

  const handleOpenTicket = async (ticket) => {
    try {
      const response = await axios.get(`${API}/support/tickets/${ticket.id}`);
      setSelectedTicket(response.data);
      setShowTicketDialog(true);
    } catch (error) {
      toast.error('Erro ao abrir ticket');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Digite uma mensagem');
      return;
    }

    try {
      await axios.post(`${API}/support/tickets/${selectedTicket.id}/messages`, {
        ticket_id: selectedTicket.id,
        message: newMessage
      });
      
      toast.success('Mensagem enviada!');
      setNewMessage('');
      
      // Refresh ticket
      const response = await axios.get(`${API}/support/tickets/${selectedTicket.id}`);
      setSelectedTicket(response.data);
      fetchTickets();
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'Aberto' },
      in_progress: { icon: MessageCircle, color: 'bg-yellow-100 text-yellow-800', label: 'Em Andamento' },
      closed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Fechado' }
    };

    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="animate-fade-in" data-testid="support-page">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center mb-4">
            <HeadphonesIcon className="h-10 w-10 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Suporte
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Precisa de ajuda? Estamos aqui para você!</p>
        </div>
        
        <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600" data-testid="new-ticket-btn">
              <Plus className="h-4 w-4 mr-2" />
              Novo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Ticket de Suporte</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Assunto</Label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Ex: Problema com pagamento"
                  data-testid="ticket-subject-input"
                />
              </div>
              <div>
                <Label>Mensagem</Label>
                <Textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Descreva seu problema ou dúvida..."
                  rows={5}
                  data-testid="ticket-message-input"
                />
              </div>
              <Button onClick={handleCreateTicket} className="w-full" data-testid="create-ticket-btn">
                Criar Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <HeadphonesIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Nenhum ticket ainda</h3>
            <p className="text-gray-600 mb-4">Crie um ticket para entrar em contato com nosso suporte</p>
            <Button onClick={() => setShowNewTicketDialog(true)} data-testid="create-first-ticket-btn">
              Criar Primeiro Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket) => (
            <Card 
              key={ticket.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleOpenTicket(ticket)}
              data-testid={`ticket-${ticket.id}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(ticket.created_at).toLocaleString('pt-BR')}
                      {ticket.messages.length > 1 && (
                        <span className="ml-2">• {ticket.messages.length} mensagens</span>
                      )}
                    </CardDescription>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {ticket.messages[0]?.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Details Dialog */}
      {selectedTicket && (
        <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedTicket.subject}</DialogTitle>
                {getStatusBadge(selectedTicket.status)}
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Messages */}
              <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {selectedTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.sender_name.includes('Admin');
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg ${
                        isAdmin 
                          ? 'bg-blue-100 border-blue-200 border' 
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold text-sm ${isAdmin ? 'text-blue-900' : 'text-gray-900'}`}>
                          {msg.sender_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input (only if not closed) */}
              {selectedTicket.status !== 'closed' && (
                <div className="space-y-2">
                  <Label>Sua Resposta</Label>
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      rows={3}
                      className="flex-1"
                      data-testid="reply-message-input"
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    data-testid="send-message-btn"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </div>
              )}

              {selectedTicket.status === 'closed' && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-800 font-semibold">
                    Este ticket foi fechado
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
