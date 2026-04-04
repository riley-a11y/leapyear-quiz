/**
 * LeapYear Assessment — Item Bank & Scale Definitions
 * Extracted from assessment.html V2 inventory
 * 85 items: A1–A33 (ORVIS), B1–B10 (CEI), C1–C6 (NCS), D1–D28 (IPIP), E1–E8 (DWECK)
 */

export const ITEMS = [
  { position: 1, id: 'B1', text: 'I actively seek as much information as I can in new situations', scale: 'CEI' },
  { position: 2, id: 'B4', text: 'Everywhere I go, I am out looking for new things or experiences', scale: 'CEI' },
  { position: 3, id: 'B5', text: 'I view challenging situations as an opportunity to grow and learn', scale: 'CEI' },
  { position: 4, id: 'B2', text: 'I am the type of person who really enjoys the uncertainty of everyday life', scale: 'CEI' },
  { position: 5, id: 'B7', text: 'I am always looking for experiences that challenge how I think about myself and the world', scale: 'CEI' },
  { position: 6, id: 'A1', text: 'Make important things happen', scale: 'ORVIS' },
  { position: 7, id: 'A16', text: 'Create works of art', scale: 'ORVIS' },
  { position: 8, id: 'A11', text: 'Help others learn new ideas', scale: 'ORVIS' },
  { position: 9, id: 'D9', text: 'Have a vivid imagination', scale: 'IPIP' },
  { position: 10, id: 'A21', text: 'Solve complex puzzles', scale: 'ORVIS' },
  { position: 11, id: 'A6', text: 'Establish time schedules', scale: 'ORVIS' },
  { position: 12, id: 'A26', text: 'Read many books', scale: 'ORVIS' },
  { position: 13, id: 'D19', text: 'Take charge', scale: 'IPIP' },
  { position: 14, id: 'B3', text: 'I am at my best when doing something that is complex or challenging', scale: 'CEI' },
  { position: 15, id: 'A2', text: 'Lead other people', scale: 'ORVIS' },
  { position: 16, id: 'A17', text: 'Write short stories or novels', scale: 'ORVIS' },
  { position: 17, id: 'D1', text: 'Work hard', scale: 'IPIP' },
  { position: 18, id: 'A12', text: 'Counsel someone who needs help', scale: 'ORVIS' },
  { position: 19, id: 'A22', text: 'Explain scientific concepts to others', scale: 'ORVIS' },
  { position: 20, id: 'D11', text: 'Enjoy thinking about things', scale: 'IPIP' },
  { position: 21, id: 'A7', text: 'Keep detailed records', scale: 'ORVIS' },
  { position: 22, id: 'A31', text: 'Construct new buildings', scale: 'ORVIS' },
  { position: 23, id: 'D13', text: 'See beauty in things that others might not notice', scale: 'IPIP' },
  { position: 24, id: 'B6', text: 'I like to do things that are a little frightening', scale: 'CEI' },
  { position: 25, id: 'A27', text: 'Keep a diary or journal', scale: 'ORVIS' },
  { position: 26, id: 'C1', text: 'I would prefer complex to simple problems', scale: 'NCS' },
  { position: 27, id: 'A3', text: 'Persuade others to change their views', scale: 'ORVIS' },
  { position: 28, id: 'D5', text: 'Complete tasks successfully', scale: 'IPIP' },
  { position: 29, id: 'A18', text: 'Write songs', scale: 'ORVIS' },
  { position: 30, id: 'A13', text: 'Provide comfort and support to others', scale: 'ORVIS' },
  { position: 31, id: 'C2', text: 'I like to have the responsibility of handling a situation that requires a lot of thinking', scale: 'NCS' },
  { position: 32, id: 'D15', text: 'Like order', scale: 'IPIP' },
  { position: 33, id: 'A23', text: 'Design an experiment to test a hypothesis', scale: 'ORVIS' },
  { position: 34, id: 'A32', text: 'Do woodworking', scale: 'ORVIS' },
  { position: 35, id: 'D21', text: 'Love large parties', scale: 'IPIP' },
  { position: 36, id: 'A8', text: 'Plan budgets', scale: 'ORVIS' },
  { position: 37, id: 'C3', text: 'Thinking is not my idea of fun', scale: 'NCS' },
  { position: 38, id: 'A28', text: 'Speak fluently on any subject', scale: 'ORVIS' },
  { position: 39, id: 'D2', text: 'Go straight for the goal', scale: 'IPIP' },
  { position: 40, id: 'B8', text: 'I prefer jobs that are excitingly unpredictable', scale: 'CEI' },
  { position: 41, id: 'A4', text: 'Debate topics in a public meeting', scale: 'ORVIS' },
  { position: 42, id: 'D23', text: 'Am easy to satisfy', scale: 'IPIP' },
  { position: 43, id: 'A19', text: 'Paint or draw', scale: 'ORVIS' },
  { position: 44, id: 'C4', text: 'I would rather do something that requires little thought than something that is sure to challenge my thinking abilities', scale: 'NCS' },
  { position: 45, id: 'A14', text: 'Help people make important decisions', scale: 'ORVIS' },
  { position: 46, id: 'D6', text: 'Know how to get things done', scale: 'IPIP' },
  { position: 47, id: 'A24', text: 'Develop a computer program', scale: 'ORVIS' },
  { position: 48, id: 'A33', text: 'Work with tools and machinery', scale: 'ORVIS' },
  { position: 49, id: 'D25', text: 'Become overwhelmed by events', scale: 'IPIP' },
  { position: 50, id: 'A9', text: 'Develop a filing system', scale: 'ORVIS' },
  { position: 51, id: 'C5', text: 'I really enjoy a task that involves coming up with new solutions to problems', scale: 'NCS' },
  { position: 52, id: 'A29', text: 'Know many languages', scale: 'ORVIS' },
  { position: 53, id: 'D17', text: 'Get chores done right away', scale: 'IPIP' },
  { position: 54, id: 'B9', text: 'I frequently seek out opportunities to challenge myself and grow as a person', scale: 'CEI' },
  { position: 55, id: 'A5', text: 'Make decisions that affect a lot of people', scale: 'ORVIS' },
  { position: 56, id: 'D3', text: 'Plunge into tasks with all my heart', scale: 'IPIP' },
  { position: 57, id: 'A20', text: 'Design web pages or digital experiences', scale: 'ORVIS' },
  { position: 58, id: 'C6', text: 'I would prefer a task that is intellectual, difficult, and important to one that is somewhat important but does not require much thought', scale: 'NCS' },
  { position: 59, id: 'A15', text: 'Participate in charity events', scale: 'ORVIS' },
  { position: 60, id: 'D27', text: 'Am afraid to draw attention to myself', scale: 'IPIP' },
  { position: 61, id: 'A25', text: 'Carry out research to answer a big question', scale: 'ORVIS' },
  { position: 62, id: 'D7', text: 'Come up with good solutions', scale: 'IPIP' },
  { position: 63, id: 'B10', text: 'I am the kind of person who embraces unfamiliar people, events, and places', scale: 'CEI' },
  { position: 64, id: 'A10', text: 'Manage a database', scale: 'ORVIS' },
  { position: 65, id: 'D4', text: 'Am not highly motivated to succeed', scale: 'IPIP' },
  { position: 66, id: 'A30', text: 'Edit a newspaper or publication', scale: 'ORVIS' },
  { position: 67, id: 'D10', text: 'Do not have a good imagination', scale: 'IPIP' },
  { position: 68, id: 'D8', text: 'Have little to contribute', scale: 'IPIP' },
  { position: 69, id: 'D12', text: 'Avoid philosophical discussions', scale: 'IPIP' },
  { position: 70, id: 'D14', text: 'Do not like art', scale: 'IPIP' },
  { position: 71, id: 'D16', text: 'Am not bothered by disorder', scale: 'IPIP' },
  { position: 72, id: 'D18', text: 'Waste my time', scale: 'IPIP' },
  { position: 73, id: 'D20', text: 'Keep in the background', scale: 'IPIP' },
  { position: 74, id: 'D22', text: 'Prefer to be alone', scale: 'IPIP' },
  { position: 75, id: 'D24', text: 'Have a sharp tongue', scale: 'IPIP' },
  { position: 76, id: 'D26', text: 'Remain calm under pressure', scale: 'IPIP' },
  { position: 77, id: 'D28', text: 'Am not embarrassed easily', scale: 'IPIP' },
  { position: 78, id: 'E1', text: 'The kind of person someone is, is something very basic about them and it can\'t be changed very much', scale: 'DWECK' },
  { position: 79, id: 'E2', text: 'People can do things differently, but the important parts of who they are can\'t really be changed', scale: 'DWECK' },
  { position: 80, id: 'E3', text: 'Everyone is a certain kind of person and there is not much that can be done to really change that', scale: 'DWECK' },
  { position: 81, id: 'E4', text: 'As much as I hate to admit it, you can\'t teach an old dog new tricks. People can\'t really change their deepest attributes', scale: 'DWECK' },
  { position: 82, id: 'E5', text: 'People can always substantially change the kind of person they are', scale: 'DWECK' },
  { position: 83, id: 'E6', text: 'Everyone, no matter who they are, can significantly change their basic characteristics', scale: 'DWECK' },
  { position: 84, id: 'E7', text: 'No matter what kind of person someone is, they can always change very much', scale: 'DWECK' },
  { position: 85, id: 'E8', text: 'People can change even the most basic qualities about themselves', scale: 'DWECK' }
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
