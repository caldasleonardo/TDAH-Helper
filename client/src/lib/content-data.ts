import { BrainIcon, BookIcon, ClockIcon, ActivityIcon } from "lucide-react";

export type ContentBlock = {
  type: 'paragraph' | 'subtitle' | 'list';
  text?: string;
  items?: string[];
};

export type Article = {
  id: number;
  title: string;
  description: string;
  category: 'basics' | 'strategies' | 'lifestyle';
  readTime: number;
  icon: typeof BrainIcon;
  content: ContentBlock[];
};

export const articles: Article[] = [
  {
    id: 1,
    title: "O que é TDAH?",
    description: "Entenda os diferentes aspectos do Transtorno do Déficit de Atenção e Hiperatividade",
    category: "basics",
    readTime: 5,
    icon: BrainIcon,
    content: [
      {
        type: "paragraph",
        text: "O Transtorno do Déficit de Atenção e Hiperatividade (TDAH) é um transtorno neurobiológico de origem genética caracterizado por sintomas de desatenção, inquietude e impulsividade. O TDAH afeta não apenas crianças e adolescentes, mas persiste na idade adulta em cerca de 60-70% dos casos."
      },
      {
        type: "subtitle",
        text: "Os três tipos de TDAH"
      },
      {
        type: "paragraph",
        text: "O TDAH pode se manifestar de três formas principais:"
      },
      {
        type: "list",
        items: [
          "Tipo predominantemente desatento: Com sintomas principalmente de desatenção, como dificuldade em manter o foco, seguir instruções e completar tarefas.",
          "Tipo predominantemente hiperativo-impulsivo: Caracterizado por inquietação constante, dificuldade em permanecer sentado, interrupção frequente de outros e tomada de decisões sem pensar nas consequências.",
          "Tipo combinado: Apresenta sintomas tanto de desatenção quanto de hiperatividade-impulsividade."
        ]
      },
      {
        type: "subtitle",
        text: "Causas do TDAH"
      },
      {
        type: "paragraph",
        text: "O TDAH tem uma forte base genética, com estudos mostrando uma herdabilidade de aproximadamente 76%. Fatores ambientais, como prematuridade, baixo peso ao nascer, exposição ao tabaco e álcool durante a gestação também podem aumentar o risco de desenvolvimento do transtorno."
      },
      {
        type: "subtitle",
        text: "Diagnóstico e tratamento"
      },
      {
        type: "paragraph",
        text: "O diagnóstico do TDAH é clínico, baseado em critérios estabelecidos por manuais de diagnóstico como o DSM-5, e deve ser realizado por profissionais qualificados como psiquiatras, neurologistas ou neuropsicólogos. O tratamento mais eficaz é multimodal, combinando medicação com intervenções psicossociais, como terapia cognitivo-comportamental, treinamento de habilidades organizacionais e orientação familiar."
      }
    ]
  },
  {
    id: 2,
    title: "Mitos e verdades sobre TDAH",
    description: "Desfazendo concepções errôneas comuns sobre o transtorno",
    category: "basics",
    readTime: 7,
    icon: BookIcon,
    content: [
      {
        type: "paragraph",
        text: "O TDAH é um dos transtornos do neurodesenvolvimento mais estudados cientificamente, mas ainda existem muitos mitos e informações equivocadas sobre sua natureza, causas e tratamento. Separar fatos de ficção é essencial para a compreensão adequada da condição."
      },
      {
        type: "subtitle",
        text: "Mito: TDAH não é uma condição médica real"
      },
      {
        type: "paragraph",
        text: "Verdade: O TDAH é reconhecido por organizações médicas em todo o mundo e possui bases neurobiológicas bem estabelecidas. Estudos de neuroimagem mostram diferenças estruturais e funcionais no cérebro de pessoas com TDAH, especialmente em regiões relacionadas à atenção, controle de impulsos e funções executivas."
      },
      {
        type: "subtitle",
        text: "Mito: TDAH é resultado de má educação ou preguiça"
      },
      {
        type: "paragraph",
        text: "Verdade: O TDAH tem origens neurobiológicas e genéticas. Não é causado por educação inadequada, alimentação ou estilo parental, embora o ambiente possa influenciar a expressão dos sintomas. Pessoas com TDAH frequentemente se esforçam mais que outras para compensar suas dificuldades."
      },
      {
        type: "subtitle",
        text: "Mito: Medicamentos para TDAH são perigosos e causam dependência"
      },
      {
        type: "paragraph",
        text: "Verdade: Quando prescritos e monitorados corretamente por profissionais de saúde, os medicamentos para TDAH são seguros e eficazes. Estudos longitudinais mostram que o tratamento adequado reduz o risco de abuso de substâncias e outros problemas associados ao TDAH não tratado."
      },
      {
        type: "subtitle",
        text: "Mito: TDAH afeta apenas crianças hiperativas"
      },
      {
        type: "paragraph",
        text: "Verdade: O TDAH afeta pessoas de todas as idades e pode manifestar-se de diferentes formas. Muitas pessoas com o tipo predominantemente desatento, especialmente meninas e mulheres, são frequentemente subdiagnosticadas por não apresentarem os sintomas clássicos de hiperatividade."
      }
    ]
  },
  {
    id: 3,
    title: "Técnicas de gerenciamento de tempo",
    description: "Estratégias práticas para melhorar sua produtividade",
    category: "strategies",
    readTime: 8,
    icon: ClockIcon,
    content: [
      {
        type: "paragraph",
        text: "Para pessoas com TDAH, o gerenciamento do tempo pode ser um desafio significativo. Funções executivas comprometidas podem afetar a capacidade de planejar, priorizar e estimar o tempo necessário para tarefas. No entanto, existem diversas estratégias que podem ajudar a superar essas dificuldades."
      },
      {
        type: "subtitle",
        text: "Bloqueio de tempo (Time Blocking)"
      },
      {
        type: "paragraph",
        text: "Esta técnica envolve dividir seu dia em blocos de tempo específicos, cada um dedicado a uma tarefa ou grupo de tarefas semelhantes. O bloqueio de tempo funciona bem para pessoas com TDAH porque cria estrutura e reduz a necessidade de tomar decisões constantes sobre o que fazer a seguir."
      },
      {
        type: "list",
        items: [
          "Dedique blocos maiores para tarefas que exigem concentração profunda",
          "Reserve blocos menores para tarefas administrativas ou de rotina",
          "Inclua intervalos regulares entre os blocos para descanso e recarga mental",
          "Use cores diferentes no calendário para categorizar os tipos de atividades"
        ]
      },
      {
        type: "subtitle",
        text: "Técnica dos 2 minutos"
      },
      {
        type: "paragraph",
        text: "Se uma tarefa pode ser concluída em dois minutos ou menos, faça-a imediatamente. Esta regra, popularizada por David Allen em seu sistema 'Getting Things Done', é particularmente útil para pessoas com TDAH porque reduz a sobrecarga cognitiva de lembrar pequenas tarefas e evita o acúmulo de pendências."
      },
      {
        type: "subtitle",
        text: "Utilização de temporizadores visíveis"
      },
      {
        type: "paragraph",
        text: "Pessoas com TDAH frequentemente têm um sentido de tempo distorcido (chamado de 'time blindness'). Usar temporizadores visíveis, como ampulhetas ou aplicativos com contagem regressiva na tela, pode ajudar a desenvolver uma melhor percepção da passagem do tempo e manter o foco durante períodos definidos de trabalho."
      },
      {
        type: "subtitle",
        text: "Sistema de lista de tarefas em cascata"
      },
      {
        type: "paragraph",
        text: "Em vez de uma única lista extensa, crie um sistema em cascata: uma lista mestra para projetos de longo prazo, uma lista semanal derivada da mestra, e uma lista diária com 3-5 tarefas prioritárias. Este método evita a sobrecarga e ajuda a focar no que é realmente importante."
      }
    ]
  },
  {
    id: 4,
    title: "Método Pomodoro adaptado para TDAH",
    description: "Como utilizar efetivamente a técnica de gerenciamento de tempo",
    category: "strategies",
    readTime: 6,
    icon: ClockIcon,
    content: [
      {
        type: "paragraph",
        text: "A técnica Pomodoro, desenvolvida por Francesco Cirillo nos anos 1980, é um método de gerenciamento de tempo que utiliza períodos de trabalho focado intercalados com pequenas pausas. Para pessoas com TDAH, algumas adaptações podem tornar esta técnica ainda mais eficaz."
      },
      {
        type: "subtitle",
        text: "O método Pomodoro tradicional"
      },
      {
        type: "list",
        items: [
          "Escolha uma tarefa para concluir",
          "Configure um temporizador para 25 minutos (um 'pomodoro')",
          "Trabalhe na tarefa até o alarme tocar",
          "Faça uma pausa curta (5 minutos)",
          "A cada 4 pomodoros, faça uma pausa mais longa (15-30 minutos)"
        ]
      },
      {
        type: "subtitle",
        text: "Adaptações para TDAH"
      },
      {
        type: "paragraph",
        text: "O método tradicional pode precisar de ajustes para pessoas com TDAH. Aqui estão algumas modificações úteis:"
      },
      {
        type: "list",
        items: [
          "Experimente com diferentes durações de trabalho: algumas pessoas com TDAH se beneficiam de períodos mais curtos (10-15 minutos) ou mais longos (40-45 minutos) dependendo da tarefa e do seu estado mental",
          "Use um temporizador visual, como uma ampulheta ou aplicativo com display proeminente, para manter a consciência do tempo",
          "Implemente um ritual de 'pré-foco' de 2 minutos para preparar seu espaço e mente antes de iniciar o temporizador",
          "Mantenha um 'caderno de distrações' ao lado para anotar rapidamente pensamentos intrusivos que surgem durante o período de foco, permitindo voltar à tarefa"
        ]
      },
      {
        type: "subtitle",
        text: "Dicas para pausas efetivas"
      },
      {
        type: "paragraph",
        text: "As pausas são tão importantes quanto os períodos de trabalho:"
      },
      {
        type: "list",
        items: [
          "Levante-se e movimente-se durante as pausas para liberar energia acumulada",
          "Evite atividades que possam se estender além do tempo da pausa (como redes sociais)",
          "Hidrate-se e coma pequenos lanches saudáveis para manter os níveis de energia",
          "Utilize técnicas de respiração ou mini-meditações para reset mental"
        ]
      },
      {
        type: "paragraph",
        text: "Lembre-se que o objetivo do método Pomodoro adaptado não é seguir rigidamente as regras, mas criar um sistema que funcione especificamente para você e suas necessidades únicas."
      }
    ]
  },
  {
    id: 5,
    title: "TDAH e relacionamentos",
    description: "Como o transtorno pode afetar suas interações sociais",
    category: "lifestyle",
    readTime: 9,
    icon: ActivityIcon,
    content: [
      {
        type: "paragraph",
        text: "O TDAH não afeta apenas os aspectos profissionais e acadêmicos da vida, mas também tem um impacto significativo nas relações interpessoais. Compreender esses efeitos pode ajudar tanto a pessoa com TDAH quanto seus parceiros, familiares e amigos a construírem relacionamentos mais saudáveis e satisfatórios."
      },
      {
        type: "subtitle",
        text: "Desafios comuns nos relacionamentos"
      },
      {
        type: "list",
        items: [
          "Esquecimento: Esquecer compromissos, aniversários ou informações importantes compartilhadas pelo parceiro pode ser interpretado erroneamente como falta de interesse ou consideração",
          "Dificuldade de escuta ativa: Interromper conversas, mudar de assunto ou parecer mentalmente ausente durante interações",
          "Regulação emocional: Reações emocionais intensas ou explosivas seguidas de rápido retorno à normalidade, o que pode confundir os outros",
          "Procrastinação: Adiar tarefas compartilhadas ou responsabilidades domésticas, criando desequilíbrio na relação",
          "Hiperfoco: Dedicar atenção intensa a atividades de interesse enquanto parece ignorar necessidades do parceiro ou da família"
        ]
      },
      {
        type: "subtitle",
        text: "Estratégias para pessoas com TDAH"
      },
      {
        type: "paragraph",
        text: "Se você tem TDAH, estas estratégias podem ajudar a melhorar seus relacionamentos:"
      },
      {
        type: "list",
        items: [
          "Comunique abertamente sobre seu TDAH, educando seu parceiro sobre como ele afeta seu comportamento",
          "Desenvolva sistemas externos para lembrar de eventos importantes (calendários compartilhados, alarmes, notas)",
          "Pratique técnicas de escuta ativa, como parafrasear o que você ouviu para confirmar entendimento",
          "Estabeleça um sinal com seu parceiro para quando você estiver se desviando do assunto durante conversas",
          "Agende um tempo regular para verificar como está o relacionamento e discutir preocupações antes que se tornem problemas maiores"
        ]
      },
      {
        type: "subtitle",
        text: "Para parceiros e familiares"
      },
      {
        type: "paragraph",
        text: "Se você se relaciona com alguém com TDAH:"
      },
      {
        type: "list",
        items: [
          "Eduque-se sobre o TDAH para distinguir entre sintomas do transtorno e questões do relacionamento",
          "Comunique necessidades e sentimentos usando frases na primeira pessoa ('eu sinto...') em vez de acusações",
          "Reconheça e valorize os pontos fortes que frequentemente acompanham o TDAH, como criatividade, entusiasmo e pensamento inovador",
          "Desenvolva um vocabulário comum para discutir como o TDAH está afetando a interação no momento",
          "Considere terapia de casal com um profissional familiarizado com TDAH para desenvolver estratégias específicas"
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Alimentação e TDAH",
    description: "O impacto da dieta nos sintomas do transtorno",
    category: "lifestyle",
    readTime: 7,
    icon: ActivityIcon,
    content: [
      {
        type: "paragraph",
        text: "Embora a alimentação não cause TDAH, pesquisas sugerem que certos padrões alimentares podem influenciar a intensidade dos sintomas em algumas pessoas. Uma abordagem nutricional adequada pode complementar outras estratégias de manejo do TDAH."
      },
      {
        type: "subtitle",
        text: "Nutrientes que podem beneficiar o funcionamento cerebral"
      },
      {
        type: "list",
        items: [
          "Ômega-3: Encontrado em peixes gordurosos, sementes de linhaça e nozes, o ômega-3 tem sido associado a melhorias na atenção e redução da impulsividade em alguns estudos",
          "Proteínas: Ajudam a manter os níveis de açúcar no sangue estáveis e fornecem aminoácidos necessários para a produção de neurotransmissores",
          "Ferro, zinco e magnésio: Deficiências destes minerais são mais comuns em pessoas com TDAH e sua suplementação pode ajudar em casos específicos",
          "Antioxidantes: Presentes em frutas e vegetais coloridos, podem proteger o cérebro contra danos oxidativos"
        ]
      },
      {
        type: "subtitle",
        text: "Padrões alimentares e refeições"
      },
      {
        type: "paragraph",
        text: "A estrutura e o conteúdo das refeições podem afetar o funcionamento cognitivo e o comportamento:"
      },
      {
        type: "list",
        items: [
          "Refeições frequentes e balanceadas: Evitam quedas de energia e ajudam a manter a concentração ao longo do dia",
          "Café da manhã rico em proteínas: Pode melhorar o foco matinal e o desempenho cognitivo",
          "Combinação adequada de carboidratos complexos, proteínas e gorduras saudáveis: Promove liberação gradual de energia e maior estabilidade do humor",
          "Hidratação adequada: A desidratação, mesmo leve, pode afetar negativamente a atenção e o processamento cognitivo"
        ]
      },
      {
        type: "subtitle",
        text: "Sensibilidades alimentares individuais"
      },
      {
        type: "paragraph",
        text: "Algumas pessoas com TDAH podem ser mais sensíveis a certos componentes alimentares:"
      },
      {
        type: "list",
        items: [
          "Aditivos alimentares: Alguns estudos sugerem que corantes artificiais e conservantes podem intensificar sintomas em indivíduos sensíveis",
          "Açúcar refinado e carboidratos simples: Podem causar flutuações rápidas nos níveis de glicose, afetando o humor e a energia",
          "Cafeína: Embora possa melhorar a atenção temporariamente, também pode aumentar a ansiedade e problemas de sono em algumas pessoas"
        ]
      },
      {
        type: "paragraph",
        text: "É importante ressaltar que as respostas à dieta são altamente individualizadas. Mudanças alimentares devem ser implementadas sob orientação profissional e avaliadas sistematicamente para determinar seus efeitos específicos em cada pessoa."
      }
    ]
  }
];