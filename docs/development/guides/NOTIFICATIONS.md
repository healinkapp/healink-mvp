# Sistema de Notificações - Healink MVP

## 📋 Visão Geral

Sistema simples de notificações em tempo real para alertar artistas sobre eventos importantes dos clientes.

---

## 🎯 Funcionalidades

### **Tipos de Notificações**

1. **Account Setup** ✅
   - Quando: Cliente completa setup da conta
   - Cor: Verde
   - Ícone: CheckCircle2

2. **Critical Phase** 🔥
   - Quando: Cliente entra em fase crítica (Day 0-7)
   - Cor: Vermelho
   - Ícone: Flame

3. **Milestone** ✨
   - Quando: Cliente atinge marcos importantes (Day 14, 30)
   - Cor: Azul
   - Ícone: Sparkles

---

## 🏗️ Estrutura

### **Componentes Criados**

```
src/
├── pages/
│   └── Notifications.jsx          # Página de notificações
├── hooks/
│   └── useUnreadNotifications.js  # Hook para contador
└── utils/
    └── notifications.js           # Helpers para criar notificações
```

### **Navegação Atualizada**

**Desktop Sidebar:**
- Dashboard (ativo)
- 🔔 Notifications (com badge)
- Settings

**Mobile Bottom Bar:**
- Dashboard
- Add (botão central)
- 🔔 Alerts (com badge)
- Settings (menu)

---

## 📊 Estrutura de Dados Firestore

### **Collection: `notifications`**

```javascript
{
  artistId: "artist_uid",        // ID do artista
  type: "account_setup",         // Tipo da notificação
  title: "João completou setup", // Título
  message: "João Silva has...",  // Mensagem detalhada
  clientId: "client_doc_id",     // ID do cliente (opcional)
  clientName: "João Silva",      // Nome do cliente (opcional)
  read: false,                   // Status de leitura
  createdAt: timestamp           // Data de criação
}
```

---

## 🔧 Como Usar

### **1. Criar Notificação Manualmente**

```javascript
import { createNotification } from '../utils/notifications';

await createNotification({
  artistId: 'artist_uid',
  type: 'milestone',
  title: 'Cliente chegou Day 30',
  message: 'Maria Silva completou a jornada de healing!',
  clientId: 'client_id',
  clientName: 'Maria Silva'
});
```

### **2. Usar Helpers Pré-definidos**

```javascript
import { 
  notifyAccountSetup,
  notifyCriticalPhase,
  notifyMilestone 
} from '../utils/notifications';

// Quando cliente completa setup
await notifyAccountSetup(artistId, clientName, clientId);

// Quando cliente entra em fase crítica
await notifyCriticalPhase(artistId, clientName, clientId, 7);

// Quando cliente atinge milestone
await notifyMilestone(artistId, clientName, clientId, 30);
```

### **3. Exibir Contador de Não Lidas**

```javascript
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';

function MyComponent() {
  const unreadCount = useUnreadNotifications();
  
  return (
    <div>
      Notificações: {unreadCount}
    </div>
  );
}
```

---

## 🚀 Próximos Passos (Futuro)

### **1. Notificações Automáticas**
Atualmente manual. Futuro: Cloud Functions disparam automaticamente.

```javascript
// Firebase Cloud Function (exemplo)
exports.onClientDayChange = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Cliente entrou Day 7
    if (after.healingDay === 7 && before.healingDay !== 7) {
      await notifyCriticalPhase(
        after.artistId,
        after.name,
        context.params.userId,
        7
      );
    }
    
    // Cliente chegou Day 30
    if (after.healingDay === 30 && before.healingDay !== 30) {
      await notifyMilestone(
        after.artistId,
        after.name,
        context.params.userId,
        30
      );
    }
  });
```

### **2. Push Notifications (Firebase Cloud Messaging)**
```javascript
// Enviar push notification para dispositivo do artista
import { getMessaging, sendToTopic } from 'firebase-admin/messaging';

await getMessaging().send({
  topic: `artist_${artistId}`,
  notification: {
    title: 'Cliente em fase crítica',
    body: 'João Silva está no Day 7'
  },
  data: {
    type: 'critical_phase',
    clientId: 'client_id'
  }
});
```

### **3. Email Notifications**
Notificar artista por email em eventos críticos.

---

## ✅ Checklist de Implementação

- [x] Página de notificações criada
- [x] Hook para contador de não lidas
- [x] Badge na navegação (Desktop + Mobile)
- [x] Helpers para criar notificações
- [x] Firestore rules atualizadas
- [x] Navegação limpa (removido Clients/Messages)
- [ ] Cloud Functions para notificações automáticas
- [ ] Push notifications (FCM)
- [ ] Email notifications

---

## 🎨 UI/UX

### **Badge de Contador**
- Mostra número de notificações não lidas
- Máximo "9+" (não mostra 10, 11, etc.)
- Cor vermelha (#EF4444)
- Aparece em Desktop sidebar e Mobile bottom bar

### **Página de Notificações**
- Lista ordenada por data (mais recente primeiro)
- Cores diferentes por tipo
- "Mark all as read" se houver não lidas
- Estado vazio com ilustração
- Click marca como lida automaticamente

---

## 🔒 Segurança (Firestore Rules)

```plaintext
// Artistas só veem suas próprias notificações
allow read: if resource.data.artistId == request.auth.uid;

// Artistas só criam notificações pra si mesmos
allow create: if request.resource.data.artistId == request.auth.uid;

// Artistas só atualizam suas próprias notificações
allow update: if resource.data.artistId == request.auth.uid;
```

---

## 📝 Notas

- **Sem push notifications por enquanto** - apenas frontend
- **Notificações manuais** - criar quando necessário
- **Preparado para futuro** - estrutura pronta para FCM
- **Performance** - real-time com onSnapshot do Firestore
