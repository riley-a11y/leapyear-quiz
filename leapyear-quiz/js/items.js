/**
 * LeapYear Assessment — Item Bank & Scale Definitions
 * 85 items grouped by scale: CEI (10), ORVIS (33), NCS (6), IPIP (28), DWECK (8)
 * Within each group, order is optimized to avoid clustering same-subscale items.
 */

export const ITEMS = [
  // ===== GROUP 1: CEI (10 items) — "How accurately does this reflect you?" =====
  { id: 'B1',  text: 'I actively seek as much information as I can in new situations', scale: 'CEI' },
  { id: 'B4',  text: 'Everywhere I go, I am out looking for new things or experiences', scale: 'CEI' },
  { id: 'B5',  text: 'I view challenging situations as an opportunity to grow and learn', scale: 'CEI' },
  { id: 'B2',  text: 'I am the type of person who really enjoys the uncertainty of everyday life', scale: 'CEI' },
  { id: 'B7',  text: 'I am always looking for experiences that challenge how I think about myself and the world', scale: 'CEI' },
  { id: 'B3',  text: 'I am at my best when doing something that is complex or challenging', scale: 'CEI' },
  { id: 'B6',  text: 'I like to do things that are a little frightening', scale: 'CEI' },
  { id: 'B8',  text: 'I prefer jobs that are excitingly unpredictable', scale: 'CEI' },
  { id: 'B9',  text: 'I frequently seek out opportunities to challenge myself and grow as a person', scale: 'CEI' },
  { id: 'B10', text: 'I am the kind of person who embraces unfamiliar people, events, and places', scale: 'CEI' },

  // ===== GROUP 2: ORVIS (33 items) — "How much would you enjoy this?" =====
  { id: 'A1',  text: 'Making important things happen', scale: 'ORVIS' },
  { id: 'A16', text: 'Creating works of art', scale: 'ORVIS' },
  { id: 'A11', text: 'Helping others learn new ideas', scale: 'ORVIS' },
  { id: 'A21', text: 'Solving complex puzzles', scale: 'ORVIS' },
  { id: 'A6',  text: 'Establishing time schedules', scale: 'ORVIS' },
  { id: 'A26', text: 'Reading many books', scale: 'ORVIS' },
  { id: 'A2',  text: 'Leading other people', scale: 'ORVIS' },
  { id: 'A17', text: 'Writing short stories or novels', scale: 'ORVIS' },
  { id: 'A12', text: 'Counseling someone who needs help', scale: 'ORVIS' },
  { id: 'A22', text: 'Explaining scientific concepts to others', scale: 'ORVIS' },
  { id: 'A7',  text: 'Keeping detailed records', scale: 'ORVIS' },
  { id: 'A31', text: 'Constructing new buildings', scale: 'ORVIS' },
  { id: 'A27', text: 'Keeping a diary or journal', scale: 'ORVIS' },
  { id: 'A3',  text: 'Persuading others to change their views', scale: 'ORVIS' },
  { id: 'A18', text: 'Writing songs', scale: 'ORVIS' },
  { id: 'A13', text: 'Providing comfort and support to others', scale: 'ORVIS' },
  { id: 'A23', text: 'Designing an experiment to test a hypothesis', scale: 'ORVIS' },
  { id: 'A32', text: 'Doing woodworking', scale: 'ORVIS' },
  { id: 'A8',  text: 'Planning budgets', scale: 'ORVIS' },
  { id: 'A28', text: 'Being articulate and well-spoken on many topics', scale: 'ORVIS' },
  { id: 'A4',  text: 'Debating topics in a public meeting', scale: 'ORVIS' },
  { id: 'A19', text: 'Painting or drawing', scale: 'ORVIS' },
  { id: 'A14', text: 'Helping people make important decisions', scale: 'ORVIS' },
  { id: 'A24', text: 'Developing a computer program', scale: 'ORVIS' },
  { id: 'A33', text: 'Working with tools and machinery', scale: 'ORVIS' },
  { id: 'A9',  text: 'Developing a filing system', scale: 'ORVIS' },
  { id: 'A29', text: 'Learning and knowing many languages', scale: 'ORVIS' },
  { id: 'A5',  text: 'Making decisions that affect a lot of people', scale: 'ORVIS' },
  { id: 'A20', text: 'Designing web pages or digital experiences', scale: 'ORVIS' },
  { id: 'A15', text: 'Participating in charity events', scale: 'ORVIS' },
  { id: 'A25', text: 'Carrying out research to answer a big question', scale: 'ORVIS' },
  { id: 'A10', text: 'Managing a database', scale: 'ORVIS' },
  { id: 'A30', text: 'Editing a newspaper or publication', scale: 'ORVIS' },

  // ===== GROUP 3: NCS (6 items) — "How accurately does this reflect you?" =====
  { id: 'C1', text: 'I would prefer complex to simple problems', scale: 'NCS' },
  { id: 'C2', text: 'I like being responsible for situations that require serious thinking', scale: 'NCS' },
  { id: 'C3', text: 'Thinking is <strong class="neg-emphasis">not</strong> my idea of fun', scale: 'NCS', boldWords: ['not'] },
  { id: 'C4', text: 'I would rather do something that requires little thought than something that is sure to challenge my thinking abilities', scale: 'NCS' },
  { id: 'C5', text: 'I really enjoy a task that involves coming up with new solutions to problems', scale: 'NCS' },
  { id: 'C6', text: 'I would prefer a task that is intellectual, difficult, and important to one that is somewhat important but does not require much thought', scale: 'NCS' },

  // ===== GROUP 4: IPIP (28 items) — "How well does this describe you?" =====
  { id: 'D9',  text: 'I have a vivid imagination', scale: 'IPIP' },
  { id: 'D19', text: 'I take charge', scale: 'IPIP' },
  { id: 'D1',  text: 'I work hard', scale: 'IPIP' },
  { id: 'D11', text: 'I enjoy thinking about things', scale: 'IPIP' },
  { id: 'D13', text: 'I see beauty in things that others might not notice', scale: 'IPIP' },
  { id: 'D15', text: 'I like order', scale: 'IPIP' },
  { id: 'D21', text: 'I love large parties', scale: 'IPIP' },
  { id: 'D5',  text: 'I complete tasks successfully', scale: 'IPIP' },
  { id: 'D2',  text: 'I go straight for the goal', scale: 'IPIP' },
  { id: 'D23', text: 'I am easy to satisfy', scale: 'IPIP' },
  { id: 'D6',  text: 'I know how to get things done', scale: 'IPIP' },
  { id: 'D25', text: 'I become overwhelmed by events', scale: 'IPIP' },
  { id: 'D17', text: 'I get chores done right away', scale: 'IPIP' },
  { id: 'D3',  text: 'I plunge into tasks with all my heart', scale: 'IPIP' },
  { id: 'D7',  text: 'I come up with good solutions', scale: 'IPIP' },
  { id: 'D27', text: 'I am afraid to draw attention to myself', scale: 'IPIP' },
  { id: 'D4',  text: 'I am <strong class="neg-emphasis">not</strong> highly motivated to succeed', scale: 'IPIP', boldWords: ['not'] },
  { id: 'D10', text: 'I do <strong class="neg-emphasis">not</strong> have a good imagination', scale: 'IPIP', boldWords: ['not'] },
  { id: 'D8',  text: 'I have <strong class="neg-emphasis">little</strong> to contribute', scale: 'IPIP', boldWords: ['little'] },
  { id: 'D12', text: 'I avoid philosophical discussions', scale: 'IPIP' },
  { id: 'D14', text: 'I do <strong class="neg-emphasis">not</strong> like art', scale: 'IPIP', boldWords: ['not'] },
  { id: 'D16', text: 'I am <strong class="neg-emphasis">not</strong> bothered by disorder', scale: 'IPIP', boldWords: ['not'] },
  { id: 'D18', text: 'I <strong class="neg-emphasis">waste</strong> my time', scale: 'IPIP', boldWords: ['waste'] },
  { id: 'D20', text: 'I keep in the background', scale: 'IPIP' },
  { id: 'D22', text: 'I prefer to be alone', scale: 'IPIP' },
  { id: 'D24', text: 'I have a sharp tongue', scale: 'IPIP' },
  { id: 'D26', text: 'I remain calm under pressure', scale: 'IPIP' },
  { id: 'D28', text: 'I am <strong class="neg-emphasis">not</strong> embarrassed easily', scale: 'IPIP', boldWords: ['not'] },

  // ===== GROUP 5: DWECK (8 items) — "How much do you agree?" =====
  { id: 'E1', text: 'The kind of person someone is, is something very basic about them and it can\'t be changed very much', scale: 'DWECK' },
  { id: 'E2', text: 'People can do things differently, but the important parts of who they are can\'t really be changed', scale: 'DWECK' },
  { id: 'E3', text: 'Everyone is a certain kind of person and there is not much that can be done to really change that', scale: 'DWECK' },
  { id: 'E4', text: 'As much as I hate to admit it, you can\'t teach an old dog new tricks. People can\'t really change their deepest attributes', scale: 'DWECK' },
  { id: 'E5', text: 'People can always substantially change the kind of person they are', scale: 'DWECK' },
  { id: 'E6', text: 'Everyone, no matter who they are, can significantly change their basic characteristics', scale: 'DWECK' },
  { id: 'E7', text: 'No matter what kind of person someone is, they can always change very much', scale: 'DWECK' },
  { id: 'E8', text: 'People can change even the most basic qualities about themselves', scale: 'DWECK' }
];

/**
 * Scale group definitions — used for transition screens between sections.
 * Order matches the ITEMS array grouping above.
 */
export const SCALE_GROUPS = [
  {
    scale: 'CEI',
    stem: 'How accurately does this reflect you?',
    count: 10,
    startIndex: 0
  },
  {
    scale: 'ORVIS',
    stem: 'How much would you enjoy this?',
    count: 33,
    startIndex: 10
  },
  {
    scale: 'NCS',
    stem: 'How accurately does this reflect you?',
    count: 6,
    startIndex: 43
  },
  {
    scale: 'IPIP',
    stem: 'How well does this describe you?',
    count: 28,
    startIndex: 49
  },
  {
    scale: 'DWECK',
    stem: 'How much do you agree?',
    count: 8,
    startIndex: 77,
    contextNote: 'These last questions might feel similar to each other — that\'s intentional. We\'re measuring something specific about how you think about growth and change. Answer each one honestly, even if they feel repetitive.'
  }
];

export const SCALES = {
  CEI: {
    stem: 'How accurately does this reflect you?',
    options: [
      { value: 1, label: 'Very Slightly or Not at All' },
      { value: 2, label: 'A Little' },
      { value: 3, label: 'Moderately' },
      { value: 4, label: 'Quite a Bit' },
      { value: 5, label: 'Extremely' }
    ]
  },
  NCS: {
    stem: 'How accurately does this reflect you?',
    options: [
      { value: 1, label: 'Very Slightly or Not at All' },
      { value: 2, label: 'A Little' },
      { value: 3, label: 'Moderately' },
      { value: 4, label: 'Quite a Bit' },
      { value: 5, label: 'Extremely' }
    ]
  },
  ORVIS: {
    stem: 'How much would you enjoy this?',
    options: [
      { value: 1, label: 'Very Much Dislike' },
      { value: 2, label: 'Dislike' },
      { value: 3, label: 'Neutral' },
      { value: 4, label: 'Enjoy' },
      { value: 5, label: 'Very Much Enjoy' }
    ]
  },
  IPIP: {
    stem: 'How well does this describe you?',
    options: [
      { value: 1, label: 'Very Inaccurate' },
      { value: 2, label: 'Moderately Inaccurate' },
      { value: 3, label: 'Neither' },
      { value: 4, label: 'Moderately Accurate' },
      { value: 5, label: 'Very Accurate' }
    ]
  },
  DWECK: {
    stem: 'How much do you agree?',
    options: [
      { value: 1, label: 'Strongly Agree' },
      { value: 2, label: 'Agree' },
      { value: 3, label: 'Mostly Agree' },
      { value: 4, label: 'Mostly Disagree' },
      { value: 5, label: 'Disagree' },
      { value: 6, label: 'Strongly Disagree' }
    ]
  }
};
