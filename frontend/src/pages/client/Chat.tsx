import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { messagesApi } from "../../api/messages";
import { serviceRequestsApi } from "../../api/serviceRequests";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../contexts/AuthContext";
import { useServiceRequestSocket } from "../../hooks/useServiceRequestSocket";
import type { Message } from "../../types/message";
import type { ServiceRequestListItem } from "../../types/serviceRequest";

export default function ClientChat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState<ServiceRequestListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const appendMessage = useCallback((msg: Message) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  useServiceRequestSocket({
    requestId: selectedId,
    onMessage: appendMessage,
  });

  useEffect(() => {
    serviceRequestsApi.list().then((d) => {
      const active = d.results.filter((r) => r.mechanic && !["cancelled"].includes(r.status));
      setRequests(active);
      const paramId = searchParams.get("request");
      if (paramId) setSelectedId(parseInt(paramId));
      else if (active.length) setSelectedId(active[0].id);
    }).catch(console.error);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) return;
    messagesApi.getForRequest(selectedId).then(setMessages).catch(console.error);
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId || !content.trim()) return;
    const msg = await messagesApi.send(selectedId, content.trim());
    appendMessage(msg);
    setContent("");
  };

  return (
    <div>
      <PageHeader title="Messages" subtitle="Chat en temps réel avec vos mécaniciens" />
      {requests.length === 0 ? (
        <EmptyState title="Aucune conversation" description="Les messages apparaîtront quand un mécanicien sera assigné." />
      ) : (
        <div className="chat-layout">
          <div className="chat-sidebar">
            {requests.map((r) => (
              <button key={r.id} type="button" className={`chat-thread${selectedId === r.id ? " active" : ""}`} onClick={() => setSelectedId(r.id)}>
                <strong>{r.title}</strong>
                <small>{r.mechanic_name}</small>
              </button>
            ))}
          </div>
          <div className="chat-main">
            <div className="chat-messages">
              {messages.map((m) => (
                <div key={m.id} className={`chat-bubble${m.sender.id === user?.id ? " mine" : ""}`}>
                  <strong>{m.sender.first_name}</strong>
                  <p>{m.content}</p>
                  <small>{new Date(m.created_at).toLocaleString("fr-FR")}</small>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="chat-input">
              <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Votre message..." />
              <button type="submit" className="btn-primary btn-sm">Envoyer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}