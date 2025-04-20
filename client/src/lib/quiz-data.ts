export const questions = [
  {
    text: "Com que frequência você tem dificuldade para manter a atenção quando está fazendo algo por um período prolongado?",
    type: "inattention",
    weight: 1
  },
  {
    text: "Você costuma perder itens necessários para atividades ou tarefas (ex: chaves, documentos, celular)?",
    type: "inattention",
    weight: 1
  },
  {
    text: "Com que frequência você se sente inquieto(a) ou incapaz de ficar parado(a)?",
    type: "hyperactivity",
    weight: 1
  },
  {
    text: "Você tem dificuldade em esperar sua vez em situações que exigem isso?",
    type: "impulsivity",
    weight: 1
  },
  {
    text: "Você costuma interromper outras pessoas quando estão falando?",
    type: "impulsivity",
    weight: 1
  },
  {
    text: "Com que frequência você se distrai com estímulos externos durante atividades que exigem concentração?",
    type: "inattention",
    weight: 1
  },
  {
    text: "Você evita ou não gosta de tarefas que exigem esforço mental prolongado?",
    type: "inattention",
    weight: 1
  },
  {
    text: "Você costuma cometer erros por descuido em tarefas diárias ou no trabalho?",
    type: "inattention",
    weight: 1
  },
  {
    text: "Com que frequência você esquece compromissos ou obrigações do dia a dia?",
    type: "inattention",
    weight: 1
  },
  {
    text: "Você tem dificuldade em organizar tarefas e atividades?",
    type: "inattention",
    weight: 1
  },
  {
    text: "Com que frequência outras pessoas dizem que você não presta atenção ao que elas falam?",
    type: "inattention",
    weight: 1
  },
  {
    text: "Você costuma agir ou falar sem pensar nas consequências?",
    type: "impulsivity",
    weight: 1
  },
  {
    text: "Você tem dificuldade em concluir projetos ou tarefas que começou?",
    type: "inattention",
    weight: 1
  },
  {
    text: "Você costuma se sentir sobrecarregado(a) ao gerenciar diversas responsabilidades?",
    type: "hyperactivity",
    weight: 1
  },
  {
    text: "Com que frequência você tem dificuldade em relaxar ou descansar?",
    type: "hyperactivity",
    weight: 1
  }
];

export const answerOptions = [
  { label: "Nunca", value: 0 },
  { label: "Às vezes", value: 1 },
  { label: "Frequentemente", value: 2 },
  { label: "Sempre", value: 3 }
];

export const interpretations = {
  low: {
    title: "Indícios Baixos",
    description: "Suas respostas indicam poucos sinais relacionados ao TDAH. Isso sugere que você provavelmente não apresenta um padrão significativo de sintomas associados ao transtorno.",
    recommendations: [
      { icon: "book", text: "Explore nossos recursos educacionais para aprender mais sobre atenção e foco" },
      { icon: "brain", text: "Considere praticar técnicas de mindfulness para melhorar sua concentração" },
      { icon: "calendar-check", text: "Acompanhe seu padrão de atenção com nosso diário de foco" }
    ]
  },
  moderate: {
    title: "Indícios Moderados",
    description: "Suas respostas indicam um nível moderado de possíveis indícios de TDAH. Isso sugere que você pode experimentar alguns desafios relacionados à atenção, foco e/ou impulsividade que podem impactar seu dia a dia.",
    recommendations: [
      { icon: "user-md", text: "Considere agendar uma consulta com um psicólogo ou psiquiatra para uma avaliação profissional" },
      { icon: "book", text: "Explore nossos recursos educacionais sobre TDAH para entender melhor os sintomas e estratégias de gerenciamento" },
      { icon: "calendar-check", text: "Experimente usar o diário de foco para rastrear seus padrões de atenção e produtividade" }
    ]
  },
  high: {
    title: "Indícios Altos",
    description: "Suas respostas indicam um nível significativo de indícios compatíveis com TDAH. Isso sugere que você pode estar enfrentando desafios substanciais relacionados à atenção, hiperatividade e/ou impulsividade em sua vida diária.",
    recommendations: [
      { icon: "user-md", text: "É recomendável buscar uma avaliação profissional com um psiquiatra ou neuropsicólogo especializado em TDAH" },
      { icon: "book", text: "Explore estratégias específicas para gerenciar sintomas de TDAH em nossa seção de conteúdo" },
      { icon: "users", text: "Considere participar de grupos de apoio ou comunidades para pessoas com TDAH" },
      { icon: "calendar-check", text: "Utilize nosso diário de foco diariamente para identificar padrões e gatilhos" }
    ]
  }
};
