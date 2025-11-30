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
    description: "Independence, creativity and initiative. Tendency to put others in charge of finishing what they start. Stubbornness and inventiveness. Leadership. Ability to do things on their own. Once decided, capable of going to any extreme to win. Enjoys a good challenge.",
  },
  [DayOfBirth.Second]: {
    description: "Sensitivity, emotionality and adaptability. Does not need to be aggressive, as they are capable of conquering everything they need. Yearns for attention and affection, enjoying collecting friendships and objects. Must stay active and think positively to avoid depression. Finds pleasure through music.",
  },
  [DayOfBirth.Third]: {
    description: "Talent, sociability and imagination. Places great value on friendships, therefore needs to be kind. Being restless and optimistic, makes life a game in which they are the main player. Possesses great personality.",
  },
  [DayOfBirth.Fourth]: {
    description: "If they follow the rules, they profit. Practical, organized and loyal. Self-disciplined, stubbornly attached to their habits. Should not demand so much from themselves. Should reserve more time to enjoy nature and family.",
  },
  [DayOfBirth.Fifth]: {
    description: "Enjoys new experiences and learns from them. Versatile, insightful and bold, detests moments of boredom. For their happiness it is essential to have freedom to travel, good company and unusual things or events.",
  },
  [DayOfBirth.Sixth]: {
    description: "Great idealist, with professorial tendencies, inclined to impose their praiseworthy viewpoints on other people. Being the target of criticism makes them very irritated. Affectionate, adaptable to domestic life and responsible, feels the need for security and to put down roots. For their happiness they need intellectual harmony.",
  },
  [DayOfBirth.Seventh]: {
    description: "Be guided by your intuition. Being the intellectual, analytical and sensitive type, should not accept any advice that goes against their principles and judgment. Should guarantee themselves a good education, specializing, and learning to enjoy their own company. Things will come to them if they can be patient and not take risks.",
  },
  [DayOfBirth.Eighth]: {
    description: "Interests in managing finances, in progressing and accumulating material goods. An organizer who sets things in motion. Vision and imagination for business. Should be tolerant and fair with the less efficient and determined. Vocation for executive positions.",
  },
  [DayOfBirth.Ninth]: {
    description: "Tolerant, apt for the arts and resolute, likes general things. Not interested in details, but rather in world problems. If well educated, could become a public figure. Capable of giving the shirt off their back to someone in difficulties, but appears to have no awareness of the needs of those around them.",
  },
  [DayOfBirth.Tenth]: {
    description: "Being capable of managing several things at the same time, enjoys diversity. Their type is intellectual, possessive and not very domestic. Has aptitude for art and vocation for business. Enthusiasm and creativity when developing projects.",
  },
  [DayOfBirth.Eleventh]: {
    description: "Despite being insecure and somewhat inhibited, is brilliant and inspired for thought and action. Those who possess this Master number have the gift of visionary intuition. Will only find pleasure through financial gains if they are serving the needs of others.",
  },
  [DayOfBirth.Twelfth]: {
    description: "Ability to achieve promotions and can both lead and work in a team. Inclination for the arts, diplomacy and good verbal skills. Needs to stay active besides finishing everything they start.",
  },
  [DayOfBirth.Thirteenth]: {
    description: "Certain feeling that their creativity is limited by attachment to order. This tends to bring a certain emotional conflict. Considered temperamental, tends to be misinterpreted very frequently. Feels happy building, buying and selling things.",
  },
  [DayOfBirth.Fourteenth]: {
    description: "Needs variety in physical and intellectual activities. Active, insightful, emotional and likes to take risks. Perseverance is as important as the variety of life experiences they yearn for. Needs not to overdo it.",
  },
  [DayOfBirth.Fifteenth]: {
    description: "Generous, expansive, domestic and protective. Enjoys music and feels they need to help others. Despite their stubbornness, manages to attract people and opportunities.",
  },
  [DayOfBirth.Sixteenth]: {
    description: "Tendency to be constantly disappointed by yearning for affection and doing nothing to obtain it. Withdrawn, introspective, inventive and analytical. Their nervousness makes their life more difficult than it really is. You are a complicated person and family ties are very important.",
  },
  [DayOfBirth.Seventeenth]: {
    description: "Hesitation between the desire to organize and to analyze. Can do both things. Should be their own boss and carefully choose their partners (if they need to have them). Seeks knowledge, has a knack for business and talent for any technical or scientific activity.",
  },
  [DayOfBirth.Eighteenth]: {
    description: "Lives for love, not having been made to stay with just one person. Strong vibrations for writing, public speaking and theatrical arts. Can be organized and efficient, if they want to. Would feel happy if their attitudes were accepted without restrictions.",
  },
  [DayOfBirth.Nineteenth]: {
    description: "May have an excess of responsibility, since it is composed of all numbers, from 1 to 9. Averse to conventions, worries about their public image. Should be a leader, preparing to adapt to the needs of others and fly high.",
  },
  [DayOfBirth.Twentieth]: {
    description: "In a group gives stability to joint effort. Friendly, cooperative and sympathetic, is a natural diplomat. Needs protection, thus needs a strong partner. Someone they can count on at all times.",
  },
  [DayOfBirth.TwentyFirst]: {
    description: "Talented, sociable and owner of a unique personality, places great importance on their love. Fertile imagination. Should use it positively, avoiding feelings of jealousy and controlling their tendency to distrust others.",
  },
  [DayOfBirth.TwentySecond]: {
    description: "Their first impressions are highly reliable, trust them. Their personal ambition should be based on motivation for the common good. Using their integrity, should organize their activities. Has creativity and capacity for initiative. This is a Master number of unlimited potential. It is the vibration of the visionary with practical sense.",
  },
  [DayOfBirth.TwentyThird]: {
    description: "Self-sufficiency, taste for social contacts and adaptability. Sensitivity and capacity for understanding that make them help others. Willingness to take on many responsibilities due to their superior faculties and practical mental character.",
  },
  [DayOfBirth.TwentyFourth]: {
    description: "Without activity, wastes their energies making a storm in a teacup. Despite being quite individualistic, enjoys domestic life. Ability to learn through observation. Even when retired, needs to continue being active.",
  },
  [DayOfBirth.TwentyFifth]: {
    description: "Appearance of an eternal dreamer, with their head in the clouds. Tendency to be misunderstood. Artistic talent, naturally intuitive and idealistic. Obstacles in their life: laziness, melancholy and dispersion of their energies. Needs to pay attention to day-to-day matters, avoiding being criticized for being so intellectual.",
  },
  [DayOfBirth.TwentySixth]: {
    description: "Enjoys physical and domestic comfort. Generosity with third parties. Knows how to reconcile professional career, marriage, and artistic abilities with ease. Introspective, has a tendency to live in the past, failing to enjoy the present.",
  },
  [DayOfBirth.TwentySeventh]: {
    description: "Natural leader, despite being somewhat erratic, is subtly convincing. Their strength lies in abstract thinking and philosophy. Gets resentful if they feel watched, or with the need to account for every movement. Quite cautious with their family relationships.",
  },
  [DayOfBirth.TwentyEighth]: {
    description: "Unconventional, loves freedom and likes to do things their own way. Should not bend to accommodate the system. Tendency to create new trends. Careful not to be overly sensitive. Should combat the laziness that lies behind the habit of daydreaming. If they don't do this, their ambitions will be greatly harmed.",
  },
  [DayOfBirth.TwentyNinth]: {
    description: "Intellectual, always ready for action, capable of great achievements. Has the ability to identify and solve the problems of the masses. Should have Master number 11 as their guiding vibration since 2 + 9 = 11. Radical in everything they do, experiences intense emotions.",
  },
  [DayOfBirth.Thirtieth]: {
    description: "Endowed with hypnotic charm, enjoys the cheerful side of life, is a great optimist. Full of imagination, detests routine and has a knack for fashion and decoration. Very lucky! Knowing how to use their oratory skills well and with a little experience, will go far.",
  },
  [DayOfBirth.ThirtyFirst]: {
    description: "If they can organize themselves and define a direction for their life, they will be successful in their high dreams. Talented for business, will feel comfortable in artistic and literary fields. The routine of domestic life is not very bearable but needs responsibility and companionship.",
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
    description: "Must learn to be original, have more willpower, be more creative and innovative. Needs to have courage and use impulse to penetrate new fields of expression as a pioneer. Works better when alone despite being a good executive. Doesn't like limitations and can be stubborn and dominating. Organized and efficient, by nature not homely. Generally likes sports and athletics. Takes pleasure in victories. Sophisticated, not emotionally romantic, always appears prominently in social or commercial groups. If they learn the lessons, they will become intimately familiar with Divine Energy, the independent spark that probes, searches and moves all creation. Is creative on the physical plane because their pioneering spirit precedes everyone else's, expressing their unique individuality.",
    goal: "The mission of path 1 is to undertake. It characterizes people with visionary spirit, who are ahead of their time and who, even alone, can achieve great revolutions and build great accomplishments.",
    positiveTraits: ["independence", "leadership", "ease in opening their own path"],
    negativeTraits: ["arrogance", "pretension", "imposition", "authoritarianism"],
  },
  [NumerologyValues.Two]: {
    description: "If you support those in leadership, helping them find their life goals, staying behind the scenes, this will help you in business. Those who will benefit from your talents will help you make use of your abilities. Must have consideration for others, bringing people together around a common cause. Will find the lessons to be learned in this life in partnerships and groups. Persuasive. Various career options, with success practically assured.",
    goal: "Path 2 has intuition as its mission. They are creative and intuitive spirits who have great ability for reflection and perception of the material and spiritual world. They develop their interior easily and possess great critical sense, in addition to constantly receiving information from the spiritual universe, managing to anticipate situations and make better decisions.",
    positiveTraits: ["understanding", "collaboration", "sensitivity", "flexibility"],
    negativeTraits: ["inaction", "laziness", "cowardice", "excessive dependence"],
  },
  [NumerologyValues.Three]: {
    description: "Superiority in intellectual, artistic or creative occupations. Need for expression, manifestation and to see the result of their work. Needs to have ambition and pride, reaching a position of authority. Needs to be careful not to be dispersive, should specialize. Averse to restriction, cannot limit themselves to routine. To achieve good results needs to work alone. Partnerships are not recommended. Should always follow their inspiration and intuition using their creative talents.",
    goal: "The great mission of path 3 is communication. They are communicative and extroverted spirits who may have facility for leadership, teaching and sharing information and knowledge. They are usually great teachers, thinkers, religious leaders or writers. Or even any other profession built around communication.",
    positiveTraits: ["communicability", "creativity", "ease in making friends"],
    negativeTraits: ["uncontrolled and frivolous use of communication", "childishness", "lack of commitment"],
  },
  [NumerologyValues.Four]: {
    description: "Needs a solid foundation to base their life on, based on a well-organized system of conduct and morals, should become a diligent worker and achieve success with honesty. Should not take risks in financial areas. Always wanting things for yesterday, will need to strive with patience and perseverance. Must learn to see reality by striving to reason in a healthy and practical way.",
    goal: "The mission of this path, the 4, is leadership. People on this path have a great inclination to occupy leadership roles, both professionally and in family or even in social relationships. It's possible they have a tendency to care too much for others, sometimes suffering the impact when the negative faces of leadership appear.",
    positiveTraits: ["willpower", "discipline", "disposition for work", "organization"],
    negativeTraits: ["blockage", "repression", "prejudice", "limitation"],
  },
  [NumerologyValues.Five]: {
    description: "Needs freedom to produce. Facility to learn through travel and experiences. Needs to avoid monotony in their life. Is in this life to learn and experience the value of freedom, but should not become too attached. Innate talents for oratory and dealing with the public.",
    goal: "Path 5 brings the mission of religion. They are spirits who, not necessarily, have a religion, but who need spiritual construction to find comfort and give meaning to their existence.",
    positiveTraits: ["freedom", "adaptability", "joviality", "good humor"],
    negativeTraits: ["inconsequence", "irresponsibility", "frivolity", "hedonism"],
  },
  [NumerologyValues.Six]: {
    description: "Learning about the sense of responsibility towards family and community. Has a wide range of professional options ahead. Needs to acquire a refined sense of balance to be able to equalize injustices. Artistic abilities and judicial talents. In order to relieve the burden of those who are naturally attracted to you, must develop compassion and understanding.",
    goal: "Path 6 has family as its main mission. They create and need very strong loving bonds and generate great spiritual return when they constitute family and build a harmonious home. Any external problem can be neutralized by the strong vibration of unconditional family love and has inclination to find meaning in the concepts of marriage, fatherhood or motherhood.",
    positiveTraits: ["family bonds", "community balance", "compassion", "solicitude"],
    negativeTraits: ["invasion of privacy", "hypocrisy", "jealousy", "indecision"],
  },
  [NumerologyValues.Seven]: {
    description: "Needs to use and develop their mind. When speaking, their words should be wise. Will often need to rely on the strength of their spirit to solve difficult problems. Tendency towards mysterious and occult research. Must learn the value of solitude in order to get in touch with their HIGHER SELF and their deepest thoughts. Since their destiny is to use the mind.",
    goal: "The 7th path has conquest as its mission. It is a strong and powerful mission, as it requires the spirit to hold the reins of destiny in their hands. Nothing comes easy for these people, as the ability to conquer and build is the aspect they must work on. With effort, dedication and patience, they can move mountains and materialize miracles.",
    positiveTraits: ["intelligence", "introspection", "study", "common sense", "depth"],
    negativeTraits: ["isolation", "coldness", "mordacity", "melancholy"],
  },
  [NumerologyValues.Eight]: {
    description: "Number of power and ambition, of the executive, of the boss, who lives by brain and physical strength. Motivates people to be successful. Needs to lead by showing through examples how to profit in business. Needs to learn to deal with power, authority and money. To build a commercial empire (which is quite likely), needs to work towards this. Opportunities in the athletic and artistic fields.",
    goal: "Brings the mission of justice and makes this the permanent and constant value for spirits who have it as their mission. Any type of situation involving justice (or even injustice) requires the life experience of those born under the influence of path 8. They are spirits who seek balance in general, and can be great lawyers or judges.",
    positiveTraits: ["sense of justice", "material ability", "haughtiness", "ambition"],
    negativeTraits: ["greed", "cupidity", "tendency to own the truth", "materialism"],
  },
  [NumerologyValues.Nine]: {
    description: "Patience, kindness and understanding are attributes that need to be cultivated. You know that personal happiness is intimately linked with the capacity to give happiness to others. Material goods will come with some ease and despite adversities, the tendency is to always be successful. Areas linked to diplomacy will be favorable to you.",
    goal: "Path 9 refers to the mission of patience. They are spirits who want to improve the world and usually have facility in exercising faith and patience in the face of the most complicated situations. They possess an almost unalterable balance and great resilience. However, when they face much restlessness and a pattern of experiences that harm serenity, they should use the strength of patience for spiritual evolution and conflict resolution.",
    positiveTraits: ["democratic sense", "speed of thought", "openness to evolution"],
    negativeTraits: ["anxiety", "lack of control", "haste", "impulsiveness"],
  },
  [NumerologyValues.Eleven]: {
    description: "The key here is altruism and community. Must practice loving your neighbor as yourself. Must use their strong intuitions to achieve wisdom and inspiration. The patterns of 11 are very high and constant, therefore, it is one of the most difficult vibrations. Must learn to have patience and also to make quick decisions. Must seek balance between material and physical life, between the life of inspiration and the spiritual. May be successful in the field of sciences, new inventions, electronics. Possesses originality and creativity and can very well make use of inspired oratory. The number 11 is an esoteric master number, of spiritual importance. Gives courage, power and talent, with strong feelings for leadership. Will need to be careful that power doesn't go to their head. Fame and recognition are probable in their life, but should recognize that true mastery is service.",
    goal: "The 11th path has intelligence as its mission, favoring the entire intellectual side and presenting situations that require clear ideas to be resolved. They are questioning spirits, regarding life and the paths they want to follow and only convince themselves of something when they can rationalize the subject by themselves.",
    positiveTraits: ["far-reaching vision", "innate spirituality", "absence of prejudice", "pioneering"],
    negativeTraits: ["obsession", "feeling of displacement (doesn't fit into any group)"],
  },
  [NumerologyValues.TwentyTwo]: {
    description: "Need to express a basic desire for development, complete things in a full way and work with large groups or commercial organizations. Enjoying long trips, may do very well in import/export trade. This number promises success. Needs to be challenged in their power of achievement. Needs to learn to take care of large companies and corporations in addition to dealing efficiently and usefully with money, for the benefit of large groups of people.",
    goal: "Path 21 brings realization as its mission. It brings good results for those who are born under this influence. They are spirits who can build, create and materialize things and situations with ease, using their inner energy to reach their goals. They possess a high level of appreciation and are determined spirits.",
    positiveTraits: ["creativity", "development of ideas", "utilization of experiences"],
    negativeTraits: ["anxiety", "haste", "excessive agility"],
  },
  [NumerologyValues.ThirtyThree]: {
    description: "Needs to be firm and reliable, developing a strong desire to protect others. Taste for natural life, which leads them not to work in areas that are harmful to humanity. Tendency to need to sacrifice their own desires for the benefit of others' needs, in order to fulfill the vibration of their Life Lesson. The consciousness of this number almost surpasses that of humanity, being similar to that of Christ in expression.",
    goal: "The mission of path 33 is to embody unconditional love and act as a master-healer and master-teacher, elevating people's consciousness through example, care, inspiration and practical teachings. It is not a path focused on personal gains, but on alleviating suffering, nurturing, forgiving and organizing life around service to the collective, manifesting in daily life the energy of compassion and healing.",
    positiveTraits: ["unconditional love", "healing and welcoming", "master / spiritual guide"],
    negativeTraits: ["self-sacrifice", "emotional exhaustion", "savior complex"],
  },
  [NumerologyValues.FortyFour]: {
    description: "Represents strength and complete mastery of the mind over their life while on Earth. Asks for discipline in every sector of life, in order to collaborate for the promotion of the world's material advancement. Needs to train their mind to let superior forces act in it, keeping their body and environment in order, to be ready for any opportunity to achieve the same results for others. Must use their enormous evolutionary energy to help others put their lives in order. Needs to try to promote better ethics and justice in the business world. Will have to recognize reality, and then use what they learned to alleviate the physical burdens of other people. You can be the instrument and channel through which this change can happen. May serve as an example to others, demonstrating bravery, resourcefulness, courage and discipline.",
    goal: "The mission of path 44 is to be a \"master builder\" on the material plane: erecting structures, companies, systems and solid projects that unite efficiency, prosperity and service to the collective. It is the vibration that combines organizing power, discipline and long-term vision to manifest on a large scale, with ethics and responsibility, integrating spiritual wisdom and concrete results in the world.",
    positiveTraits: ["discipline and focus", "master material builder", "responsible leadership"],
    negativeTraits: ["workaholic and rigidity", "obsession with results", "coldness and internal pressure"],
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
  [ChallengeNumbers.Zero]: "Can be said to function as no challenge and all other challenges together. It is a difficult challenge, as it suffers the emotional reactions of all numbers, but the person knows what their problems are and must learn to face them, one at a time.",
  [ChallengeNumbers.One]: "Swings between maximum independence and lack of initiative. Can act both with arrogance and with weakness. Difficulty making decisions. Must learn not to waver. There may be a very strong connection with the father. Exaggerated reactions.",
  [ChallengeNumbers.Two]: "Tendency to get lost in minutiae or to ignore details. Must fight against the tendency toward excessive submission and being grumpy, complaining about everything and everyone, without justification. Oscillation between extreme sensitivity and a total refusal to be influenced by emotions. May not have received enough love from the mother or still have an excessively strong connection with her. Tendency to have problems with women. Should not always take things personally.",
  [ChallengeNumbers.Three]: "Excessive attention to external appearance and indifference toward social interaction rules. Ability to speak at the wrong time. Waste of energy. Must develop perceptive capacity. Avoid talking too much or staying silent when it's time to speak. Should measure words more carefully.",
  [ChallengeNumbers.Four]: "Can present either as a severe self-disciplinarian or with extreme lack of organization. Either does everything or does nothing. Always oscillates between extremes. Must develop perceptive capacity.",
  [ChallengeNumbers.Five]: "Periods of exhaustion and boredom. Can either jump from experience to experience or cling to the security of a pre-established routine. Sex and material pleasures should not be so important in their life. Needs to be more responsible, leaving impulsiveness aside as it will only bring suffering. Must learn to restrain themselves.",
  [ChallengeNumbers.Six]: "Desire to impose opinions on others and be enslaved by the people they love. Can either assume responsibilities that don't concern them or have no responsibility at all. Needs to learn not to meddle in what is not their business, in addition to knowing how to adapt to new situations. Must learn to accept and listen to others' opinions. Idealism that can transform into hypocrisy.",
  [ChallengeNumbers.Seven]: "Oscillation between naive behavior and total lack of trust in others. Arrogance or lack of self-love. Lacking faith, they fear being rejected, loneliness, poverty and life's realities. Should not be afraid to share their thoughts and emotions.",
  [ChallengeNumbers.Eight]: "Stinginess or dissipation. Can worry excessively about material life or show total carelessness. Has thirst for power, but lacks ambition. Needs to use common sense and play fair. Should not evaluate everything in terms of material value.",
}

export const CHALLENGE_HEALTH_MEANING: Record<ChallengeNumbers & NumerologyValues, string> = {
  [ChallengeNumbers.Zero]: "There is no illness associated with the number zero.",
  [ChallengeNumbers.One]: "Prone to diseases in the head, headaches, sinusitis, allergies, injuries to the eyes, ears and head.",
  [ChallengeNumbers.Two]: "Tendency to retain fluids in the body. Delicate nervous system and kidneys.",
  [ChallengeNumbers.Three]: "May suffer from diseases that affect the throat, liver and glands.",
  [ChallengeNumbers.Four]: "Prone to chronic diseases and problems with teeth, bones, intestines, digestion and circulation.",
  [ChallengeNumbers.Five]: "Nervous or prone to accidents. May have problems with reproductive organs.",
  [ChallengeNumbers.Six]: "May suffer from chronic diseases or have circulatory and spinal problems.",
  [ChallengeNumbers.Seven]: "Propensity for congestion, infections and nervous problems.",
  [ChallengeNumbers.Eight]: "May have excess weight, high blood pressure, undergo surgical interventions. Propensity for problems with digestion, pancreas, stomach and nerves.",
  [NumerologyValues.Nine]: "Energy of deeply rooted attachment especially with diseases, can generate hypochondria.",
  [NumerologyValues.Eleven]: "Can bring much dispersion or lack of care with health, has difficulties doing preventive exams.",
  [NumerologyValues.TwentyTwo]: "Has tendencies to increase diseases and their impacts.",
  [NumerologyValues.ThirtyThree]: "Finds difficulties seeking help when necessary due to the master's energy.",
  [NumerologyValues.FortyFour]: "Has a tendency to be very efficient including in health treatments.",
}

export const PERSONAL_CYCLE_KEYWORDS: Record<NumerologyValues, string[]> = {
  [NumerologyValues.One]: ["new beginnings", "action", "originality", "decision making"],
  [NumerologyValues.Two]: ["harmony", "cooperation", "mediation", "passivity"],
  [NumerologyValues.Three]: ["dispersion", "freedom", "entertainment", "self expression"],
  [NumerologyValues.Four]: ["practical nature", "work", "order", "foundation building"],
  [NumerologyValues.Five]: ["change", "freedom", "new intellectual interests", "travel"],
  [NumerologyValues.Six]: ["family", "health", "assistance", "attention to others' problems"],
  [NumerologyValues.Seven]: ["self-analysis", "achievement", "health problems"],
  [NumerologyValues.Eight]: ["business", "power", "responsibility", "money"],
  [NumerologyValues.Nine]: ["self-denial", "endings", "service"],
  [NumerologyValues.Eleven]: ["notoriety", "inspiration", "religion"],
  [NumerologyValues.TwentyTwo]: ["materialism", "great endeavors"],
  [NumerologyValues.ThirtyThree]: ["sacrifice", "compassion for others"],
  [NumerologyValues.FortyFour]: ["helping solve others' daily problems", "counseling"],
}

export const PERSONAL_YEAR_DESCRIPTIONS: Record<NumerologyValues, string> = {
  [NumerologyValues.One]: "Put yourself into action. Use your initiative and set things in motion. The seeds planted now will have a greater chance of surviving throughout the entire cycle. Good time to start a new relationship, move to a new address, make a career change, and dedicate yourself to a new hobby. Develop your ideas, be positive, and don't hesitate to remain true to your decisions. Using your creative energy will allow you to achieve everything you desire.",
  [NumerologyValues.Two]: "This is a year of many emotions. You may fall in love and fall out of love. The seeds you plant now will germinate this year. Water them well. Pay attention to details, but be careful not to overdo it. Accumulate knowledge, meet new people, and acquire things. Assimilate, be receptive. Cooperate, be kind even when you feel like giving a sharp response. Patience, tact, and diplomacy will bring you everything you desire.",
  [NumerologyValues.Three]: "This is a year for you to have fun. Enjoy it! The seeds you planted in year 1 will bear fruit now. Expand your circle of friends, take good care of yourself, and make yourself noticed. Don't get involved in anything that could restrict your freedom. Develop the skills necessary to express your ideas and feelings. It will be worthwhile to speak in public or write. Social contacts will help you achieve everything you desire.",
  [NumerologyValues.Four]: "This is the year to build the foundations of your future and work hard. The vibration of 4 is about routine and organization. Systematize, be practical, and keep your feet on the ground. Cultivate solid relationships. It's a good time to organize your home. And since the body is the soul's shelter, exercise and diet are also important. By focusing on organization, you will obtain everything you want, this year and the next.",
  [NumerologyValues.Five]: "This is your year to renew yourself, travel, take on fewer responsibilities, and meet people. You will mature in a new way. Expect the unexpected. Let yourself be carried by your inner strength and the vibration of freedom. Be receptive to what is new. Free yourself from what is boring or limiting. Enjoy the pleasures of food, drink, and sex (without excess, of course). This is the year to reap the rewards for everything you accomplished in the previous year. The vibration of freedom will give you everything you desire.",
  [NumerologyValues.Six]: "This year you will be more settled than in the previous year, and your responsibilities will also be greater. Your commitments will be firmer; it's a good time to think about marriage as the vibration of 6 favors lasting relationships. Love and you will be loved, protect and you will be protected. You will have to adapt to others, you will have to act with more awareness regarding anything or anyone important in your life. Reconciliation will help you achieve what you want.",
  [NumerologyValues.Seven]: "Don't force decisions. Make only the unavoidable changes. If you start a romance now, you may be forced to share your new love with a third person. If the relationship doesn't change by the end of the year, it will most likely continue stable. It's a good year to write, study, and engage in deeper reflections. Rest, spend some hours alone every day, take vacations somewhere near water, and trust your intuition. You can achieve everything you want by letting things come to you: this year is for inner development; the following year for material gains.",
  [NumerologyValues.Eight]: "This is the best year to improve your business and the state of your finances. Money comes, money goes. Focus your attention on finances and material values. Get that raise, that promotion, and the greater power that comes with it. Organize your time. This year you will make a sensation. What remained hidden in year 7 will manifest now. Take care of your health by getting an annual check-up. Using common sense, everything will work out satisfactorily.",
  [NumerologyValues.Nine]: "This is your year to conclude things. Clean out the closets, finish your projects. Eliminate that blacklist of yours. What's done is done. Although changes that are coming in the next few years are already in the air, it's unlikely that anything you start this year will last very long. Either it will end before the year is over, or it will change again. The vibration of 9 will bring you nostalgia. You may have an exaggerated reaction and become temperamental. This year your family is the world. Keeping an open mind and broad perspective will help you achieve what you want.",
  [NumerologyValues.Eleven]: "Material matters occupy a secondary position this year. You may be absorbed by your own idealism and end up discovering that you don't always have your feet on the ground. Refine your tastes, expand your consciousness, and share your talents. This is an especially creative year for writers and artists. For people working in commercial activities, this is the year of diplomacy and gratitude. For spiritually oriented people, this is a year of illumination. Following this visionary vibration will help you obtain what you long for.",
  [NumerologyValues.TwentyTwo]: "This is your year to have an idea and make it concrete. Now you are a visionary who transforms an idea into reality. The highest master vibration is within you this year. Plan your activities, structure your dreams, serve others, and you will see that this will be a very successful year. Maintain balance and guard against radicalism and nervous tension. Working with this powerful practical vibration, you will achieve what you desire.",
  [NumerologyValues.ThirtyThree]: "This is a year that intensifies themes of love, family, and emotional responsibility. The energy calls for compassion, healing, and service: people may seek you out for support, guidance, or comfort, and your sensitivity tends to become more acute. Use your creative and spiritual talents to uplift and help others, but without taking on the role of savior or martyr. Take care of your boundaries, practice self-care, and let unconditional love manifest through concrete gestures. Living this vibration of service with balance, you can have deeply meaningful experiences and transform important bonds in your life.",
  [NumerologyValues.FortyFour]: "This is a year that enhances material achievements and the ability to build something great and lasting. The energy favors concrete accomplishments, professional expansion, and long-term structural projects, where your leadership and sense of responsibility become evident. Organization, discipline, and strategic vision will be essential to make the most of this cycle. Keep your feet on the ground, manage time and finances well, and don't sacrifice health or emotional life for success. Using this power ethically and in balance, you can consolidate very prosperous foundations and positively influence your surroundings.",
};