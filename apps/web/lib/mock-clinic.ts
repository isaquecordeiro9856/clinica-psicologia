export type AppointmentStatus = 'confirmada' | 'pendente' | 'realizada' | 'cancelada'

export const appointments = [
  { id: '1', time: '08:30', end: '09:20', patient: 'Mariana Costa', initials: 'MC', type: 'Terapia individual', status: 'realizada' as AppointmentStatus, color: 'teal' },
  { id: '2', time: '10:00', end: '10:50', patient: 'Rafael Mendes', initials: 'RM', type: 'Terapia individual', status: 'confirmada' as AppointmentStatus, color: 'blue' },
  { id: '3', time: '11:30', end: '12:20', patient: 'Julia Azevedo', initials: 'JA', type: 'Terapia individual', status: 'confirmada' as AppointmentStatus, color: 'violet' },
  { id: '4', time: '14:00', end: '14:50', patient: 'Lucas Ferreira', initials: 'LF', type: 'Avaliação inicial', status: 'pendente' as AppointmentStatus, color: 'amber' },
  { id: '5', time: '16:30', end: '17:20', patient: 'Camila Nunes', initials: 'CN', type: 'Terapia individual', status: 'confirmada' as AppointmentStatus, color: 'rose' },
]

export const patients = [
  { id: '1', name: 'Mariana Costa', initials: 'MC', age: 29, lastSession: 'Hoje, 08:30', status: 'Em acompanhamento', color: 'teal' },
  { id: '2', name: 'Rafael Mendes', initials: 'RM', age: 34, lastSession: 'Hoje, 10:00', status: 'Em acompanhamento', color: 'blue' },
  { id: '3', name: 'Julia Azevedo', initials: 'JA', age: 26, lastSession: 'Hoje, 11:30', status: 'Em acompanhamento', color: 'violet' },
  { id: '4', name: 'Lucas Ferreira', initials: 'LF', age: 41, lastSession: 'Há 7 dias', status: 'Aguardando retorno', color: 'amber' },
]

export const tasks = [
  { id: '1', title: 'Finalizar prontuário de Mariana', due: 'Hoje', priority: 'Alta', done: false },
  { id: '2', title: 'Enviar recibos de agosto', due: 'Amanhã', priority: 'Média', done: false },
  { id: '3', title: 'Revisar anotações da sessão', due: 'Hoje', priority: 'Baixa', done: true },
]

export const weeklyRevenue = [
  { day: 'Seg', value: 820 }, { day: 'Ter', value: 1240 }, { day: 'Qua', value: 960 },
  { day: 'Qui', value: 1480 }, { day: 'Sex', value: 1120 }, { day: 'Sáb', value: 420 },
]

export const activities = [
  { text: 'Nota clínica atualizada', detail: 'Mariana Costa · há 12 min', icon: 'file' },
  { text: 'Novo paciente cadastrado', detail: 'Pedro Henrique · há 1 h', icon: 'user' },
  { text: 'Pagamento recebido', detail: 'R$ 180,00 · há 2 h', icon: 'payment' },
]
