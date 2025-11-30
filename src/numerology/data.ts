export enum HeptadCycles {
  First = 1,
  Second = 2,
  Third = 3,
  Fourth = 4,
  Fifth = 5,
  Sixth = 6,
  Seventh = 7,
}

export type CycleMeaning = {
  title: string;
  shortDescription: string;
  personalDescription: string;
  businessDescription: string;
}

export type Cycle = {
  number: number;
  description: CycleMeaning;
  isActive?: boolean;
  cycleStart?: Date;
}

export type CycleInfo = {
  yearlyCycles: Cycle[];
  ageCycles: Cycle[];
  monthlyCycles: Cycle[];
  currentYearlyCycle: number | null;
  currentAgeCycle: number | null;
  currentMonthlyCycle: number | null;
  daysInMonthlyCycle: number;
  totalDays: number;
}

export type KaabalisticLifePathResult = {
  parts: {
    day: string;
    month: string;
    year1: string;
    year2: string;
  };
  reducedParts: {
    reducedDay: number;
    reducedMonth: number;
    reducedYear1: number;
    reducedYear2: number;
  };
  syntheses: {
    dayMonthSynthesis: number;
    yearSynthesis: number;
    reducedDayMonthSynthesis: number;
    reducedYearSynthesis: number;
    finalSynthesis: number;
  };
  lifePath: number;
  /**
   * Last three syntheses
   */
  personalMythologyNumbers: number[];
};

export type StraightAcrossReductionLifePathResult = {
  lifePath: number;
  reductionSteps: number[];
};

export type DateEnergies = {
  dayEnergy: ReducedValueWithSteps;
  monthEnergy: ReducedValueWithSteps;
  yearEnergy: ReducedValueWithSteps;
};

export type Challenges = {
  day: number;
  month: number;
  year: number;
  mainChallenge: number;
  subChallenge1: number;
  subChallenge2: number;
};

export type ReducedValueWithSteps = {
  reducedValue: number;
  reductionSteps: number[];
};

export type FibonacciCycle = {
  currentAge: number;
  cycle1: ReducedValueWithSteps;
  cycle2: ReducedValueWithSteps;
  cycle3: ReducedValueWithSteps;
  cycle4: ReducedValueWithSteps;
  cycle5: ReducedValueWithSteps;
  cycle6: ReducedValueWithSteps;
  cycle7: ReducedValueWithSteps;
};

export type PersonalPeriod = {
  startMonth: number;
  endMonth: number;
  value: ReducedValueWithSteps;
};

export type PersonalMonth = {
  month: number;
  value: ReducedValueWithSteps;
};

export type PersonalCycles = {
  personalYear: ReducedValueWithSteps;
  personalPeriods: [PersonalPeriod, PersonalPeriod, PersonalPeriod];
  personalMonths: [
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth,
    PersonalMonth
  ];
  currentPersonalPeriod: number;
  currentPersonalMonth: number;
  currentAge: number;
  lifePath: number;
  soulNumber?: ReducedValueWithSteps;
  yearUsedOnCalculations: number;
};

export const CYCLE_MEANINGS: Record<HeptadCycles, CycleMeaning> = {
  [HeptadCycles.First]: {
    title: "Learning",
    shortDescription:
      "A period for assertive action and learning through direct experience.",
    personalDescription:
      "This period emphasizes assertive action and learning through direct experience. Utilize personal influence to seek favors, loans, or recognition from influential individuals such as government officials or community leaders. Ideal for enhancing personal reputation and prestige, keeping in mind that all actions carry consequences.",
    businessDescription:
      "Ideal for promotional activities aimed at building goodwill, public recognition, and securing endorsements from prominent individuals. Prioritize the company's image and reputation over immediate profits.",
  },
  [HeptadCycles.Second]: {
    title: "Hard Work",
    shortDescription:
      "A time for diligent effort and adaptability to temporary changes.",
    personalDescription:
      "A period where diligent effort and adaptability are crucial. Suitable for temporary changes such as moving homes, short trips, or career shifts. Avoid long-term commitments or significant investments unless carefully formalized.",
    businessDescription:
      "Ideal for short-term experiments, temporary staffing adjustments, and forming beneficial business connections. Steer clear of verbal agreements or long-term commitments unless formally documented. Flexibility leads to progress.",
  },
  [HeptadCycles.Third]: {
    title: "Friendship",
    shortDescription:
      "A dynamic phase for ambitious projects and strengthening relationships.",
    personalDescription:
      "A dynamic and energetic phase ideal for initiating ambitious projects requiring persistence and physical strength. Effective communication strengthens relationships, but impulsiveness should be avoided to prevent conflicts.",
    businessDescription:
      "Ideal for expansion, energetic ventures, and assertive promotional activities. Excellent for debt collection but avoid legal conflicts. Maintain vigilance against accidents and disputes while leveraging strong communication.",
  },
  [HeptadCycles.Fourth]: {
    title: "Opportunities",
    shortDescription:
      "An intellectually fertile time for creativity and quick decision-making.",
    personalDescription:
      "An intellectually fertile phase ideal for creative projects, innovation, and quick decision-making. Beware of deception, especially concerning documents or agreements. Foster mental growth and create valuable connections, but remain cautious.",
    businessDescription:
      "Perfect for launching impactful marketing campaigns and securing new agreements. Excellent for promotional activities and intellectual creativity, but carefully scrutinize documents to avoid fraud.",
  },
  [HeptadCycles.Fifth]: {
    title: "Tears/Decision",
    shortDescription:
      "The most prosperous phase for financial resolution and spiritual advancement.",
    personalDescription:
      "The most prosperous phase of the year, suitable for resolving financial issues, starting long journeys, and advancing spiritually. Interact with influential figures, manage debts, and engage in expansive social activities. Keep ego and selfishness balanced for optimal outcomes.",
    businessDescription:
      "A prime time for investments, financial growth, global promotion, debt collection, and favorable legal outcomes. Emphasize fairness and generosity to enhance business success.",
  },
  [HeptadCycles.Sixth]: {
    title: "Triple Blessing",
    shortDescription:
      "Perfect for pleasures, social activities, and creative pursuits.",
    personalDescription:
      "Ideal for enjoying pleasures, social activities, artistic endeavors, and short travels. Favorable for romantic interactions, relaxation, and creative pursuits. Organize personal life to balance enjoyment and refinement effectively.",
    businessDescription:
      "Excellent time for promoting luxury products, arts, entertainment, and speculative investments. Ideal for forming friendly business alliances and strategic partnerships.",
  },
  [HeptadCycles.Seventh]: {
    title: "Rest",
    shortDescription:
      "A period of rest, introspection, and preparation for renewal.",
    personalDescription:
      "A critical period of rest, introspection, and cautious preparation for renewal. Avoid initiating new ventures and instead focus on completing pending matters, managing legal affairs carefully, and protecting existing resources. Balance and patience are essential.",
    businessDescription:
      "Period to conserve resources, avoid major expansions, and carefully manage internal restructuring. Postpone significant new ventures until the next cycle. Act diplomatically and cautiously to ensure stability.",
  },
};

export enum NumerologyValues {
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
  Nine = 9,
  Eleven = 11,
  TwentyTwo = 22,
  ThirtyThree = 33,
  FortyFour = 44,
}

// todo: translate to english and improve keywords
export const NUMEROLOGY_KEYWORDS: Record<NumerologyValues, string[]> = {
  [NumerologyValues.One]: ["Initiative", "Courage", "Leadership"],
  [NumerologyValues.Two]: ["Sensitivity", "Cooperation", "Diplomacy"],
  [NumerologyValues.Three]: ["Creativity", "Expression", "Joy"],
  [NumerologyValues.Four]: ["Stability", "Structure", "Reliability"],
  [NumerologyValues.Five]: ["Freedom", "Adaptability", "Adventure"],
  [NumerologyValues.Six]: ["Service", "Responsibility", "Harmony"],
  [NumerologyValues.Seven]: ["Intuition", "Introspection", "Wisdom"],
  [NumerologyValues.Eight]: ["Power", "Ambition", "Material Success"],
  [NumerologyValues.Nine]: ["Compassion", "Universal Vision", "Humanitarianism"],
  [NumerologyValues.Eleven]: ["Intuition", "Illumination", "Spiritual Messenger"],
  [NumerologyValues.TwentyTwo]: ["Vision", "Master Builder", "Manifestation"],
  [NumerologyValues.ThirtyThree]: ["Unconditional Love", "Master Teacher", "Healing Service"],
  [NumerologyValues.FortyFour]: ["Material Mastery", "Strategic Leadership", "Legacy Building"],
}

export enum DayOfBirth {
  First = 1,
  Second = 2,
  Third = 3,
  Fourth = 4,
  Fifth = 5,
  Sixth = 6,
  Seventh = 7,
  Eighth = 8,
  Ninth = 9,
  Tenth = 10,
  Eleventh = 11,
  Twelfth = 12,
  Thirteenth = 13,
  Fourteenth = 14,
  Fifteenth = 15,
  Sixteenth = 16,
  Seventeenth = 17,
  Eighteenth = 18,
  Nineteenth = 19,
  Twentieth = 20,
  TwentyFirst = 21,
  TwentySecond = 22,
  TwentyThird = 23,
  TwentyFourth = 24,
  TwentyFifth = 25,
  TwentySixth = 26,
  TwentySeventh = 27,
  TwentyEighth = 28,
  TwentyNinth = 29,
  Thirtieth = 30,
  ThirtyFirst = 31,
};

export type DayOfBirthMeaning = {
  description: string;
}

export const DAY_OF_BIRTH_MEANING: Record<DayOfBirth, DayOfBirthMeaning> = {
  [DayOfBirth.First]: {
    description: "Independência, criatividade e iniciativa. Propensão a encarregar outras pessoas de terminar o que começa. Obstinação e inventividade. Liderança. Capacidade para fazer as coisas por si próprio. Uma vez decidido, é capaz de chegar a qualquer extremo para vencer. Gosta de um bom desafio.",
  },
  [DayOfBirth.Second]: {
    description: "Sensibilidade, emotividade e adaptabilidade. Não necessita ser agressivo, já que é capaz de conquistar tudo aquilo de que precisa anseia por atenção e afeto, gostando de colecionar amizades e objetos. Deve manter-se em atividade e pensar de forma positiva para evitar a depressão. Prazer através da música.",
  },
  [DayOfBirth.Third]: {
    description: "Talento, sociabilidade e imaginação. Dá grande valor as amizades, por isso precisa ser gentil. Sendo inquieto e otimista, faz da vida um jogo no qual é o principal jogador. Possui muita personalidade.",
  },
  [DayOfBirth.Fourth]: {
    description: "Se seguir as regras, sai lucrando. É prático, organizado e leal. Autodisciplinado, se apega teimosamente aos seus hábitos. Não deve exigir tanto de si mesmo. Deve reservar mais tempo para curtir a natureza e a família.",
  },
  [DayOfBirth.Fifth]: {
    description: "Gosta de experiências novas e aprende com elas. Versátil, perspicaz e ousado, detesta momentos de tédio. Para a sua felicidade é essencial que tenha liberdade para viajar, boa companhia e coisas ou acontecimentos fora do comum.",
  },
  [DayOfBirth.Sixth]: {
    description: "Grande idealista, com tendências professorais, inclina-se a impor seus louváveis pontos de vista às outras pessoas. Sendo alvo de críticas fica muito irritado. É afetuoso, adaptável à vida doméstica e responsável, sente necessidade de segurança e de criar raízes. Para sua felicidade necessita de harmonia intelectual.",
  },
  [DayOfBirth.Seventh]: {
    description: "Guie-se por sua intuição. Sendo do tipo intelectual, analítico e sensível, não deve aceitar qualquer conselho que vá contra os seus princípios e julgamento. Deve garantir a si próprio uma boa educação, especializando-se, e aprendendo a usufruir de sua própria companhia. As coisas irão ao seu encontro se conseguir ser paciente e não se arriscar.",
  },
  [DayOfBirth.Eighth]: {
    description: "Interesses em administrar finanças, em progredir e acumular bens materiais. É um organizador que põe as coisas em movimento. Visão e imaginação para negócios. Deve ser tolerante e justo com os menos eficientes e determinados. Vocação para cargos executivos.",
  },
  [DayOfBirth.Ninth]: {
    description: "Tolerante, apto para as artes e resoluto, gosta de coisas gerais. Não se interessa por detalhes, mas sim pelos problemas mundiais. Se bem educado, poderá vir a ser uma figura pública. É capaz de dar a camisa para alguém em dificuldades, mas aparenta não ter consciência das necessidades daqueles que estão ao seu redor.",
  },
  [DayOfBirth.Tenth]: {
    description: "Sendo capaz de administrar diversas coisas ao mesmo tempo, gosta da diversidade. Seu tipo é intelectual, possessivo e não muito caseiro. Possui aptidão para a arte e vocação para negócios. Entusiasmo e criatividade ao desenvolver projetos.",
  },
  [DayOfBirth.Eleventh]: {
    description: "Apesar de inseguro e um tanto inibido, é brilhante e inspirado para o pensamento e para a ação. Quem possui este número Mestre, tem o dom da intuição visionária. Só terá prazer através dos ganhos financeiros se estiver atendendo as necessidades dos outros.",
  },
  [DayOfBirth.Twelfth]: {
    description: "Capacidade para conseguir promoções e tanto pode liderar como trabalhar em equipe. Pendor para as artes, diplomacia e boa habilidade verbal. Necessita se manter em atividade além de terminar tudo aquilo que começa.",
  },
  [DayOfBirth.Thirteenth]: {
    description: "Certo sentimento de que sua criatividade seja limitada pelo apega à ordem. Isso tende a trazer um certo conflito emocional. Tido como temperamental, tende a ser mal interpretado com muita frequência. Sente-se feliz construindo, comprando e vendendo coisas.",
  },
  [DayOfBirth.Fourteenth]: {
    description: "Necessita de variedade nas atividades físicas e intelectuais. Ativo, perspicaz, emotivo e gosta de correr riscos. A perseverança é tão importante quanto a variedade de experiências de vida pelas quais anseia. Precisa não exagerar.",
  },
  [DayOfBirth.Fifteenth]: {
    description: "Generoso, expansivo, caseiro e protetor. Gosta de música e sente que necessita ajudar os outros. Apesar de sua teimosia, consegue atrair pessoas e oportunidades.",
  },
  [DayOfBirth.Sixteenth]: {
    description: "Tendência a ficar desapontado constantemente por ansiar por afeição e não fazer nada para obtê-la. Arredio, introspectivo, inventivo e analítico. Seu nervosismo faz com que sua vida se torne mais difícil do que realmente é. Você é uma pessoa complicada e os laços familiares são muito importantes.",
  },
  [DayOfBirth.Seventeenth]: {
    description: "Hesitação entre o desejo de organizar e de analisar. Pode fazer as duas coisas. Deve ser seu próprio patrão e escolher cuidadosamente seus sócios (se necessitar tê-los). Busca o conhecimento, tem jeito para os negócios e talento para qualquer atividade técnica ou cientifica.",
  },
  [DayOfBirth.Eighteenth]: {
    description: "Vive pelo amor, não tendo sido feito para ficar com uma so pessoa. Fortes vibrações para escrever, falar em público e para as artes teatrais. Pode ser organizado e eficiente, se quiser. Sentir-se-ia feliz se suas atitudes fossem aceitas sem restrições.",
  },
  [DayOfBirth.Nineteenth]: {
    description: "Pode ter um excesso de responsabilidade, já que se compõe de todos números, de 1 a 9. Avesso as convenções, preocupa-se com sua imagem pública. Deve ser líder, preparando-se para se adaptar as necessidades dos outros e voar alto.",
  },
  [DayOfBirth.Twentieth]: {
    description: "Num grupo dá estabilidade ao esforço conjunto. Amigável, cooperativo e simpático, é um diplomata nato. Necessita de proteção, assim, precisa de um parceiro ou parceira forte. Alguém com quem possa contar em todas as horas.",
  },
  [DayOfBirth.TwentyFirst]: {
    description: "Talentoso, sociável e dono de uma personalidade singular, dá muita importância ao seu amor. Imaginação fértil. Deve usá-la de forma positiva, evitando o sentimento de ciúmes e controlando sua tendência para desconfiar dos outros.",
  },
  [DayOfBirth.TwentySecond]: {
    description: "Suas primeiras impressões são altamente confiáveis, confie nelas. Sua ambição pessoal deve basear-se numa motivação em favor do bem comum. Usando sua integridade, deve organizar suas atividades. Tem criatividade e capacidade de iniciativa. Este é um número Mestre de potencial ilimitado. É a vibração do visionário com senso prático.",
  },
  [DayOfBirth.TwentyThird]: {
    description: "Autossuficiência, gosto pelos contatos sociais e adaptabilidade. Sensibilidade e capacidade de compreensão que fazem com que ajude os outros. Disposição para assumir muitos encargos devido a suas faculdades superiores e de seu caráter prático mental.",
  },
  [DayOfBirth.TwentyFourth]: {
    description: "Sem atividade, desperdiça suas energias fazendo tempestade em copo d'água. Apesar de bastante individualista, gosta da vida caseira. Capacidade de aprender através da observação. Mesmo aposentado, necessita continuar em atividade.",
  },
  [DayOfBirth.TwentyFifth]: {
    description: "Aparência de um eterno sonhador, com a cabeça nas nuvens. Tendência a ser incompreendido. Talento artístico, naturalmente intuitivo e idealista. Empecilhos em sua vida: a preguiça, a melancolia e a dispersão de suas energias. Necessita dar atenção aos assuntos do dia a dia, evitando ser criticado por ser tão intelectual.",
  },
  [DayOfBirth.TwentySixth]: {
    description: "Gosta do conforto físico e doméstico. Generosidade com terceiros. Sabe conciliar carreira profissional, casamento, e habilidades artísticas com facilidade. Introspectivo, tem tendência a viver no passado, deixando de gozar o presente.",
  },
  [DayOfBirth.TwentySeventh]: {
    description: "Líder nato, apesar de um tanto errático, é sutilmente convincente. Seu forte são o pensamento abstrato e a filosofia. Fica ressentido se se sentir vigiado, ou com necessidade de prestar contas a respeito de cada movimento. Bastante cauteloso com suas relações familiares.",
  },
  [DayOfBirth.TwentyEighth]: {
    description: "Anti convencional, ama a liberdade e gosta de fazer as coisas à sua maneira. Não deve dobrar-se para se acomodar ao sistema. Tendência a criar novas tendências. Cuidado para não ser excessivamente sensível. Deve combater a preguiça que se encontra por trás do hábito de sonhar acordado. Se não fizer isso, suas ambições serão muito prejudicadas.",
  },
  [DayOfBirth.TwentyNinth]: {
    description: "Intelectual, sempre disposto à ação, capaz de grandes realizações. Tem capacidade de identificar e de equacionar os problemas das massas. Deve ter como vibração guia o número Mestre 11 já que 2 + 9 = 11. Radical em tudo que faz, experimenta emoções intensas.",
  },
  [DayOfBirth.Thirtieth]: {
    description: "Dotado de um encanto hipnótico, gosta de usufruir o lado alegre da vida, é um grande otimista. Cheio de imaginação, detesta a rotina e tem um jeito para moda e decoração. Tem muita sorte! Sabendo usar bem sua aptidão em oratória e com um pouco de experiência, vai longe.",
  },
  [DayOfBirth.ThirtyFirst]: {
    description: "Se conseguir se organizar e definir um rumo para sua vida, será bem-sucedido em seus altos sonhos. Talentoso para os negócios, se sentirá bem à vontade nos campos artístico e literário. A rotina da vida doméstica não é muito suportável mas necessita de responsabilidade e companheirismo.",
  },
};

export type LifePathMeaning = {
  description: string;
  goal: string;
  positiveTraits: string[];
  negativeTraits: string[];
}

export const LIFEPATH_MEANING: Record<NumerologyValues, LifePathMeaning> = {
  [NumerologyValues.One]: {
    description: "Deve aprender a ser original, ter mais força de vontade, ser mais criativo e inovador. Precisa ter coragem e usar o impulso a fim de penetrar novos campos de expressão sendo pioneiro. Trabalha melhor quando sozinho apesar de ser bom executivo. Não gosta de limitações e pode ser obstinado e dominante. Organizado e eficiente, por natureza não é caseiro. Em geral gosta de esportes e de atletismo. Prazer nas vitórias. Sofisticado, não emocionalmente romântico, sempre aparece com destaque em grupos sociais ou comerciais. Se aprender as lições, irá se familiarizar intimamente com a Energia Divina, a fagulha independente que sonda, procura e move toda a criação. É criativo no plano físico porque o seu espirito pioneiro precede o de todos, expressando a sua individualidade única.",
    goal: "A missão do caminho 1 é empreender. Caracteriza pessoas com espírito visionário, que estão à frente de seu tempo e que, mesmo sozinhos, conseguem realizar grandes revoluções e construir grandes realizações.",
    positiveTraits: ["independência", "liderança", "facilidade em abrir caminho por si só"],
    negativeTraits: ["arrogância", "pretensão", "imposição", "autoritarismo"],
  },
  [NumerologyValues.Two]: {
    description: "Se apoiar os que ocupam a liderança, ajudando-os a encontrarem suas metas da vida, ficando nos bastidores, isso irá ajuda-lo nos negócios. Os que se beneficiarão com os seus talentos irão ajudá-lo a fazer uso de suas habilidades. Deve ter consideração pelos outros, reunindo as pessoas em torno de uma causa em comum. Encontrara as lições a serem aprendidas nesta vida em parcerias e em grupos. Persuasivo. Várias opções na carreira, estando praticamente assegurado o sucesso.",
    goal: "O caminho 2 tem como missão a intuição. São espíritos criativos e intuitivos que têm grande habilidade para a reflexão e percepção do mundo material e espiritual. Desenvolvem seu interior facilmente e possuem grande senso crítico, além de receberem informações do universo espiritual constantemente, conseguindo antecipar situações e tomar melhores decisões.",
    positiveTraits: ["compreensão", "colaboração", "sensibilidade", "flexibilidade"],
    negativeTraits: ["inação", "preguiça", "covardia", "dependência excessiva"],
  },
  [NumerologyValues.Three]: {
    description: "Superioridade em ocupações intelectuais, artísticas ou criativas. Necessidade de expressão, manifestação e de ver o resultado do seu trabalho. Precisa ter ambição e orgulho, alcançando posição de autoridade. Precisa ter cuidado para não ser dispersivo, devendo se especializar. Avesso à restrição, não consegue se limitar a rotina. Para alcançar bons resultados precisa trabalhar sozinho. Sociedades não são recomendadas. Deve sempre seguir sua inspiração e intuição usando seus talentos criativos",
    goal: "A grande missão do caminho 3 é a comunicação. São espíritos comunicativos e extrovertidos que podem ter facilidade para a liderança, ensinamentos e compartilhamento de informações e conhecimentos. Normalmente são grandes professores, pensadores, líderes religiosos ou escritores. Ou ainda, qualquer outra profissão construída em torno da comunicação.",
    positiveTraits: ["comunicabilidade", "criatividade", "facilidade em fazer amigos"],
    negativeTraits: ["uso descontrolado e leviano da comunicação", "infantilidade", "descompromisso"],
  },
  [NumerologyValues.Four]: {
    description: "Precisa de uma base sólida para fundamentar sua vida, baseando-se num sistema bem organizado de conduta e moral, devendo tornar-se um trabalhador diligente e conseguir o sucesso com honestidade. Não deve arriscar nas áreas financeiras. Querendo sempre as coisas para ontem, precisará se empenhar com paciência e perseverança. Deve aprender a ver a realidade esforçando-se por raciocinar de modo sadio e prático.",
    goal: "A missão deste caminho, o 4, é a liderança. As pessoas desse caminho têm uma grande inclinação para ocupar papéis de liderança, tanto no profissional quanto no familiar ou até mesmo em relações sociais. É possível que tenha tendência a cuidar demais do próximo, sofrendo algumas vezes o impacto quando as faces negativas da liderança aparecem.",
    positiveTraits: ["força de vontade", "disciplina", "disposição para o trabalho", "organização"],
    negativeTraits: ["bloqueio", "repressão", "preconceito", "limitação"],
  },
  [NumerologyValues.Five]: {
    description: "Precisa de liberdade para produzir. Facilidade para aprender com viagens e com experiências. Precisa evitar a monotonia em sua vida. Está nesta vida para aprender e experimentar o valor da liberdade, mas não deve se prender em demasia. Talentos inatos para a oratória e no trato com o público.",
    goal: "O caminho 5 traz a missão da religião. São espíritos que, não necessariamente, possuem uma religião, mas que necessitam da construção espiritual para encontrar conforto e dar sentido à sua existência.",
    positiveTraits: ["liberdade", "adaptabilidade", "jovialidade", "bom humor"],
    negativeTraits: ["inconsequência", "irresponsabilidade", "leviandade", "hedonismo"],
  },
  [NumerologyValues.Six]: {
    description: "Aprendizado sobre o senso de responsabilidade para com a família e a comunidade. Tem pela frente amplo leque de opções profissionais. Precisa adquirir um refinado sentido de equilíbrio para poder igualar injustiças. Habilidades artísticas e talentos judiciais. A fim de aliviar a carga dos que naturalmente são atraídos por você, deve desenvolver a compaixão e a compreensão.",
    goal: "O caminho 6 tem como principal missão a família. Criam e precisam de laços amorosos fortíssimos e geram um grande retorno espiritual quando constituem família e constroem um lar harmonioso. Qualquer problema externo pode ser neutralizado pela forte vibração de amor incondicional familiar e tem inclinação a encontrarem sentido nos conceitos de matrimônio, paternidade ou maternidade.",
    positiveTraits: ["laços familiares", "equilíbrio comunitário", "compaixão", "solicitude"],
    negativeTraits: ["invasão de privacidade", "hipocrisia", "ciúme", "indecisão"],
  },
  [NumerologyValues.Seven]: {
    description: "Precisa usar e desenvolver sua mente. Quando falar, suas palavras deverão ser sábias. Precisará muitas vezes confiar na força de seu espírito a fim de resolver problemas difíceis. Tendência a pesquisas misteriosas e do oculto. Deve aprender o valor da solidão a fim de entrar em contato com seu EU SUPERIOR e seus pensamentos mais profundos. Já que o seu destino é usar a mente",
    goal: "O 7° caminho tem como missão a conquista. É uma missão forte e poderosa, pois exige que o espírito tenha nas mãos as rédeas do destino. Nada vem fácil para essas pessoas, pois a habilidade de conquistar e construir é o aspecto que elas devem trabalhar. Com esforço, dedicação e paciência, conseguem mover montanhas e materializar milagres.",
    positiveTraits: ["inteligência", "introspecção", "estudo", "bom senso", "profundidade"],
    negativeTraits: ["isolamento", "frieza", "mordacidade", "melancolia"],
  },
  [NumerologyValues.Eight]: {
    description: "Número do poder e da ambição, do executivo, do chefe, que vive do cérebro e da força física. Motiva as pessoas a serem bem-sucedidas. Precisa liderar mostrando através de exemplos como lucrar nos negócios. Precisa aprender a lidar com o poder, a autoridade e o dinheiro. Para construir um império comercial (o que é bastante provável), precisa trabalhar nesse sentido. Oportunidades no campo do atletismo e artístico.",
    goal: "Traz a missão da justiça e faz deste o valor permanente e constante para os espíritos que o tem como missão. Qualquer tipo de situação envolvendo justiça (ou mesmo injustiça) requer a experiência de vida dos nascidos sob a influência do caminho 8. São espíritos que buscam o equilíbrio de forma geral, podendo ser grandes advogados ou juízes.",
    positiveTraits: ["senso de justiça", "habilidade material", "altivez", "ambição"],
    negativeTraits: ["ganância", "cupidez", "tendência a ser dono da verdade", "materialismo"],
  },
  [NumerologyValues.Nine]: {
    description: "Paciência, gentileza e compreensão são atributos que precisa cultivar. Você sabe que a felicidade pessoal está intimamente ligada com a capacidade de dar felicidade aos outros. Bens materiais advirão com certa facilidade e apesar de adversidades, a tendência é que seja bem-sucedido sempre. As áreas ligadas a diplomacia lhe serão favoráveis.",
    goal: "O caminho 9 faz referência à missão da paciência. São espíritos que desejam melhorar o mundo e normalmente têm facilidade de exercitar a fé e a paciência frente às situações mais complicadas. Possuem um equilíbrio quase inalterável e grande resiliência. Porém, quando enfrentam muita inquietude e um padrão de experiências que prejudicam a serenidade, devem utilizar a força da paciência para evolução espiritual e resolução de conflitos.",
    positiveTraits: ["senso democrático", "rapidez de pensamento", "abertura à evolução"],
    negativeTraits: ["ansiedade", "descontrole", "pressa", "impulsividade"],
  },
  [NumerologyValues.Eleven]: {
    description: "A chave aqui é altruísmo e comunidade. Deve praticar o amar ao próximo como a si mesmo. Deve usar suas fortes intuições para conseguir sabedoria e inspiração. Os padrões do 11 são muito elevados e constantes, por isso, é uma das vibrações mais difíceis. Deve aprender a ter paciência e também a tomar decisões rápidas. Deve procurar o equilíbrio entre vida material e física, entre a vida da inspiração e a espiritual. Poderá ser bem-sucedido no campo das ciências, das novas invenções, da eletrônica. Possui originalidade e criatividade podendo muito bem fazer uso de oratória inspirada. O número 11 é um número mestre esotérico, de importância espiritual. Dá coragem, poder e talento, com fortes sentimentos para a liderança. Precisará tomar cuidado para que o poder não lhe suba à cabeça. Fama e reconhecimento são prováveis em sua vida, mas deverá reconhecer que a verdadeira mestria é o serviço.",
    goal: "O 11°caminho tem como missão a inteligência, favorecendo todo o lado intelectual e apresentando situações que exigem ideias claras para que sejam resolvidas. São espíritos questionadores, com relação à vida e aos caminhos que querem seguir e só se convencem de algo quando conseguem racionalizar o assunto por si mesmos.",
    positiveTraits: ["visão de largo alcance", "espiritualidade nata", "ausência de preconceito", "pioneirismo"],
    negativeTraits: ["obsessão", "sensação de deslocamento (não se encaixa em nenhum grupo)"],
  },
  [NumerologyValues.TwentyTwo]: {
    description: "Necessidade de expressar um anseio básico de desenvolvimento, completar as coisas de um modo pleno e trabalhar com grandes grupos ou organizações comerciais. Gostando das viagens longas, poderá se dar muito bem no comércio de importação / exportação. Este número promete sucesso. Precisa ser desafiado em seu poder de realização. Precisa aprender a cuidar de grandes empresas e corporações além de lidar eficientemente e de modo útil com o dinheiro, para o benefício de grandes grupos de pessoas.",
    goal: "O caminho 21 traz como missão a realização. Traz bons resultados para aqueles que nascem sob essa influência. São espíritos que conseguem construir, criar e materializar coisas e situações com facilidade, usando sua energia interior para alcançar suas metas. Possuem um alto nível de valorização e são espíritos determinados.",
    positiveTraits: ["criatividade", "desenvolvimento de ideias", "aproveitamento de experiências"],
    negativeTraits: ["ansiedade", "pressa", "agilidade em excesso"],
  },
  [NumerologyValues.ThirtyThree]: {
    description: "Precisa ser firme e confiável, desenvolvendo um forte desejo de proteger os outros. Gosto pela vida natural, o que o leva a não trabalhar em áreas que sejam prejudiciais a humanidade. Tendência a necessidade de sacrificar seus próprios desejos em benefício das necessidades dos outros, a fim de cumprir a vibração da sua Lição de Vida. A consciência deste número quase ultrapassa a da humanidade, sendo semelhante à do Cristo em expressão.",
    goal: "A missão do caminho 33 é encarnar o amor incondicional e atuar como mestre-curador e mestre-professor, elevando a consciência das pessoas por meio de exemplo, cuidado, inspiração e ensinamentos práticos. Não é um caminho focado em ganhos pessoais, mas em aliviar o sofrimento, nutrir, perdoar e organizar a vida em torno do serviço ao coletivo, manifestando no dia a dia a energia da compaixão e da cura.",
    positiveTraits: ["amor incondicional", "cura e acolhimento", "mestre / guia espiritual"],
    negativeTraits: ["auto-sacrifício", "esgotamento emocional", "complexo de salvador"],
  },
  [NumerologyValues.FortyFour]: {
    description: "Representa a força e o domínio completo da mente sobre a sua vida enquanto estiver na Terra. Pede disciplina em cada setor da vida, de modo a colaborar para a promoção do avanço material do mundo. Precisa treinar sua mente a fim de deixar que forças superiores ajam nela, mantendo o seu corpo e meio ambiente em ordem, para estar pronto para qualquer oportunidade de conseguir os mesmos resultados para outros. Deve usar sua enorme energia evolutiva para auxiliar os outros a colocar suas vidas em ordem. Precisa tentar promover uma ética e uma justiça melhores no mundo dos negócios. Terá de reconhecer a realidade, e em seguida usar o que aprendeu para aliviar os fardos físicos de outras pessoas. Você pode ser o instrumento e canal através do qual essa alteração pode acontecer. Poderá servir de exemplo aos outros, demonstrando bravura, desembaraço, coragem e disciplina.",
    goal: "A missão do caminho 44 é ser um \"mestre construtor\" no plano material: erguer estruturas, empresas, sistemas e projetos sólidos que unam eficiência, prosperidade e serviço ao coletivo. É a vibração que combina poder organizador, disciplina e visão de longo prazo para manifestar em grande escala, com ética e responsabilidade, integrando sabedoria espiritual e resultados concretos no mundo",
    positiveTraits: ["disciplina e foco", "mestre construtor material", "liderança responsável"],
    negativeTraits: ["workaholic e rigidez", "obsessão por resultados", "frieza e pressão interna"],
  },
}

export enum ChallengeNumbers {
  Zero = 0,
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
}

export const CHALLENGE_MEANING: Record<ChallengeNumbers, string> = {
  [ChallengeNumbers.Zero]: "Pode-se dizer que funciona como nenhum desafio e todos os demais desafios juntos. É um desafio difícil, pois sofre as reações emocionais de todos os números, mas a pessoa sabe quais são os seus problemas e deve aprender a enfrentá-los, um de cada vez.",
  [ChallengeNumbers.One]: "Balança entre a máxima independência e a falta de iniciativa. Pode agir tanto com arrogância como com fraqueza. Dificuldade para tomar decisões. Deve aprender a não vacilar. Pode haver uma ligação muito forte com o pai. Reações exageradas.",
  [ChallengeNumbers.Two]: "Tendência a se perder em minúcia ou então ignorar os detalhes. Deve lutar contra a tendência à submissão excessiva e a ser rabugento, reclamando de tudo e de todos, sem justificativa. Oscilação entre a extrema sensibilidade e uma total recusa em se deixar influenciar pelas emoções. Pode não ter recebido amor suficiente por parte da mãe ou ainda ter uma ligação excessivamente forte com ela. Tendência a ter problemas com mulheres. Não deve encarar as coisas sempre de forma pessoal.",
  [ChallengeNumbers.Three]: "Atenção desmedida ao aspecto exterior e a indiferença em relação às regras de convívio social. Capacidade para falar na hora errada. Desperdício de energias. Deve desenvolver a capacidade de percepção. Evite falar demais ou se calar na hora de falar. Deve medir mais suas palavras.",
  [ChallengeNumbers.Four]: "Tanto pode apresentar-se como um severo auto disciplinador como com uma falta de organização extrema. Ou faz tudo ou então não faz nada. Oscila sempre entre os extremos. Deve desenvolver sua capacidade perceptiva.",
  [ChallengeNumbers.Five]: "Períodos de exaustão e de tédio. Tanto pode pular de experiência em experiência como apegar-se à segurança de uma rotina pré-estabelecida. Sexo e prazeres materiais não deveriam ser tão importantes em sua vida. Precisa ser mais responsável, deixando a impulsividade de lado pois a mesma só lhe trará sofrimento. Deve aprender a conter-se.",
  [ChallengeNumbers.Six]: "Desejo de impor suas opiniões aos outros e ser escravo das pessoas que ama. Tanto pode assumir responsabilidades que não lhe dizem respeito como não ter responsabilidade nenhuma. Precisa aprender a não se meter no que não é de sua conta, além de saber se adaptar a novas situações. Deve aprender a aceitar e ouvir a opinião dos outros. Idealismo que pode transformar-se em hipocrisia.",
  [ChallengeNumbers.Seven]: "Oscilação entre um comportamento ingênuo e a total falta de confiança nos outros. Arrogância ou falta de amor próprio. Faltando-lhe a fé, tem medo de ser rejeitado, da solidão, da pobreza e das realidades da vida. Não deve ter receio de dividir seus pensamentos e emoções.",
  [ChallengeNumbers.Eight]: "Sovinice ou dissipação. Pode preocupar-se em demasia com a vida material ou total displicência. Tem sede de poder, mas carência de ambição. Precisa usar o bom senso e jogar limpo. Não deve avaliar tudo em termos de valor material.",
}

export const CHALLENGE_HEALTH_MEANING: Record<ChallengeNumbers & NumerologyValues, string> = {
  [ChallengeNumbers.Zero]: "Não existe nenhuma enfermidade associada ao número zero.",
  [ChallengeNumbers.One]: "Propenso a doenças na cabeça, dores, sinusite, alergias, ferimentos nos olhos, nas orelhas e na cabeça.",
  [ChallengeNumbers.Two]: "Tendência para reter líquidos no organismo. Sistema nervoso e rins delicados.",
  [ChallengeNumbers.Three]: "Pode vir a sofrer doenças que afetam a garganta, o fígado e as glândulas.",
  [ChallengeNumbers.Four]: "Propenso a sofrer de doenças crônicas e a ter problemas com os dentes, os ossos, os intestinos, a digestão e a circulação.",
  [ChallengeNumbers.Five]: "Nervoso ou propenso a acidentes. Pode ter problemas com os órgãos reprodutores.",
  [ChallengeNumbers.Six]: "Pode vir a sofrer de doenças crônicas ou ter problemas circulatórios e da coluna.",
  [ChallengeNumbers.Seven]: "Propensão à congestão, às infecções e a problemas nervosos.",
  [ChallengeNumbers.Eight]: "Pode ter excesso de peso, pressão alta, sofrer intervenções cirúrgicas. Propensão a problemas com a digestão, o pâncreas, o estômago e os nervos.",
  [NumerologyValues.Nine]: "Energia do apego muito enraizado principalmente com doenças, pode gerar hipocondrias.",
  [NumerologyValues.Eleven]: "Pode trazer muita dispersão ou falta de cuidado com a saúde, tem dificuldades de fazer exames de prevenções.",
  [NumerologyValues.TwentyTwo]: "Tem tendências de aumentar as doenças e seus impactos.",
  [NumerologyValues.ThirtyThree]: "Encontra dificuldades de buscar ajuda quando necessário devido a energia do mestre.",
  [NumerologyValues.FortyFour]: "Tem uma tendência para ser bem eficiente inclusive em tratamentos de saúde.",
}

export const PERSONAL_CYCLE_KEYWORDS: Record<NumerologyValues, string[]> = {
  [NumerologyValues.One]: ["novos inicios", "ação", "originalidade", "tomada de decisão"],
  [NumerologyValues.Two]: ["harmonia", "cooperação", "mediação", "passividade"],
  [NumerologyValues.Three]: ["dispersão", "liberdade", "entretenimento", "auto expressão"],
  [NumerologyValues.Four]: ["natureza pratica", "trabalho", "ordem", "estabelecimento de alicerces"],
  [NumerologyValues.Five]: ["mudança", "liberdade", "novos interesses intelectuais", "viagens"],
  [NumerologyValues.Six]: ["família", "saúde", "assistência", "atenção a problemas dos outros"],
  [NumerologyValues.Seven]: ["autoanálise", "realização", "problemas de saúde"],
  [NumerologyValues.Eight]: ["negócios", "poder", "responsabilidade", "dinheiro"],
  [NumerologyValues.Nine]: ["abnegação", "términos", "préstimos"],
  [NumerologyValues.Eleven]: ["notoriedade", "inspiração", "religião"],
  [NumerologyValues.TwentyTwo]: ["materialismo", "grandes empenhos"],
  [NumerologyValues.ThirtyThree]: ["sacrifício", "compaixão pelos outros"],
  [NumerologyValues.FortyFour]: ["auxilio na solução dos problemas cotidianos dos outros", "aconselhamento"],
}

export const PERSONAL_YEAR_DESCRIPTIONS: Record<NumerologyValues, string> = {
  [NumerologyValues.One]: "Ponha-se em ação. Use a sua iniciativa e ponha as em andamento. As sementes plantadas agora terão maior probabilidade de resistir durante todo o ciclo. Boa ocasião para começar um novo relacionamento, mudar-se para um novo endereço, fazer o uma mudança de curso em sua carreira e dedicar se a um novo hobby. Desenvolva suas ideias, seja o positivo e não hesite em permanecer fiel às suas decisões. O uso da sua energia criativa lhe permitirá conseguir tudo o que você deseja.",
  [NumerologyValues.Two]: "Este é um ano de muitas emoções. Você poderá apaixonar-se e desapaixonar-se. As sementes que você plantar agora germinarão ainda este ano. Regue-as bem. Preste atenção aos detalhes, mas tome cuidado para não exagerar. Acumule conhecimentos, conheça novas pessoas e compre coisas. Assimile, seja receptivo. Coopere, seja gentil mesmo quando sentir vontade de dar uma resposta atravessada. Paciência, tato e diplomacia lhe trarão tudo o que desejar.",
  [NumerologyValues.Three]: "Este é um ano para você se divertir. Aproveite-o! As sementes que você plantou no ano 1 irão frutificar agora. Amplie o seu círculo de amizades, cuide-se bem e faça-se notar. Não se envolva em nada que poderá tolher a sua liberdade. Desenvolva as habilidades necessárias para a expressão de suas idéias e sentimentos. Valerá a pena falar em público ou escrever. Os contatos sociais o ajudarão a conseguir tudo o que você deseja.",
  [NumerologyValues.Four]: "Este e o ano para construir os alicerces do seu futuro, e trabalhar com afinco. A vibração do 4 é da rotina, da organização. Sistematize, seja prático e mantenha os pês no chão. Cultive relacionamentos sólidos. É uma boa ocasião para arrumar a casa. E, como o corpo é o abrigo da alma, exercícios e dieta também são importantes. Concentrando-se na organização, você obterá tudo o que quiser, neste ano e no que vem.",
  [NumerologyValues.Five]: "Este é o seu ano para renovar-se, viajar, assumir menos responsabilidades e conhecer pessoas. Você amadurecerá de um modo novo. Conte com o inesperado. Deixe-se levar pela sua força interior e pela vibração de liberdade. Seja receptivo ao que é novo. Livre-se do que é enfadonho ou limitante. Aproveite os prazeres da comida, da bebida e do sexo (sem exageros, claro). Este é o ano de colher as recompensas por tudo o que você realizou no ano anterior. A vibração de liberdade lhe dará tudo o que deseja.",
  [NumerologyValues.Six]: "Neste ano você estará mais assentado do que no ano anterior, e suas responsabilidades também serão maiores. Seus compromissos serão mais firmes; boa hora para pensar em casamento pois a vibração do 6 favorece relacionamentos duradouros. Ame e será amado, proteja e será protegido. Você terá de se adaptar aos outros, terá de agir com mais consciência em relação a qualquer coisa ou pessoa que seja importante em sua vida. A conciliação o ajudará a conseguir o que quer.",
  [NumerologyValues.Seven]: "Não force decisões. Faça apenas as modificações inadiáveis. Se começar um romance agora, poderá ser obrigado a dividir seu novo amor com uma terceira pessoa. Caso o relacionamento não se altere até o fim do ano, o mais provável é que continue estável. É um bom ano para escrever, estudar e se dedicar a algumas reflexões mais profundas. Descanse, fique algumas horas sozinho todos os dias, saia em férias para algum lugar próximo à água e confie na sua intuição. Você poderá conseguir tudo o que quiser deixando que as coisas venham até você: este ano é para o desenvolvimento interior: o ano seguinte para ganhos materiais.",
  [NumerologyValues.Eight]: "Este é o melhor ano para melhorar seus negócios e o estado de suas finanças. O dinheiro vem, o dinheiro vai. Concentre sua atenção nas finanças e nos valores materiais. Consiga aquele aumento, aquela promoção e o maior poder que dela decorre. Organize seu tempo. Neste ano você fará furor. O que permaneceu oculto no ano 7 irá se manifestar agora. Cuide da saúde fazendo um check up anual. Usando o bom senso, tudo se realizará a contento.",
  [NumerologyValues.Nine]: "Este é o seu ano para concluir as coisas. Limpe os armários, termine seus projetos. Elimine aquela sua lista negra. Águas passadas não movem moinhos. Embora mudanças que estão por vir nos próximos anos já estejam no ar, não é provável que qualquer coisa que você comece este ano vá resistir por muito tempo. Das duas uma: ou terminará antes do final do ano, ou voltará a mudar. A vibração do 9 lhe trará nostalgia. Você poderá apresentar uma reação exagerada e se tornar temperamental. Neste ano sua família é o mundo. Conservar a mente aberta e a largueza de vistas o ajudará a conseguir o que quer.",
  [NumerologyValues.Eleven]: "Os assuntos materiais ocupam uma posição secundária neste ano. Você poderá ser absorvido pelo seu próprio idealismo e acabar descobrindo que nem sempre tem os pés no chão. Aprimore os seus gostos, expanda a sua consciência e compartilhe os seus talentos. Este é um ano especialmente criativo para escritores e artistas. Para pessoas que trabalham em atividades comerciais, este é o ano da diplomacia e dos agradecimentos. Para pessoas voltadas para o espiritual, este é um ano de iluminação. Seguir com esta vibração visionária ajudará você a obter o que anseia.",
  [NumerologyValues.TwentyTwo]: "Este é o seu ano para ter uma idéia e concretizá-la. Agora você é um visionário que transforma uma idéia em realidade. A vibração mestra mais elevada está em você neste ano. Planeje suas atividades, estruture seus sonhos, preste serviço aos outros e você verá que este vai ser um ano de muito sucesso. Mantenha o equilíbrio e acautele-se contra o radicalismo e a tensão nervosa. Trabalhando com esta poderosa vibração prática, você irá conseguir o que deseja.", 
  [NumerologyValues.ThirtyThree]: "Este é um ano que intensifica os temas do amor, da família e da responsabilidade afetiva. A energia pede compaixão, cura e serviço: pessoas podem procurar você em busca de apoio, orientação ou consolo, e sua sensibilidade tende a ficar mais aguçada. Use seus talentos criativos e espirituais para elevar e ajudar os outros, mas sem assumir o papel de salvador ou mártir. Cuide dos seus limites, pratique o auto-cuidado e deixe que o amor incondicional se manifeste por meio de gestos concretos. Vivendo essa vibração de serviço com equilíbrio, você pode ter experiências profundamente significativas e transformar vínculos importantes na sua vida.",
  [NumerologyValues.FortyFour]: "Este é um ano que potencializa as conquistas materiais e a capacidade de construir algo grande e duradouro. A energia favorece realizações concretas, expansão profissional e projetos estruturais de longo prazo, em que sua liderança e sentido de responsabilidade ficam em evidência. Organização, disciplina e visão estratégica serão essenciais para aproveitar ao máximo esse ciclo. Mantenha os pés no chão, administre bem tempo e finanças e não sacrifique a saúde nem a vida afetiva em nome do sucesso. Usando esse poder de forma ética e equilibrada, você pode consolidar bases muito prósperas e influenciar positivamente o meio à sua volta.",
};