export type GlossaryCategory = "Parliamentary" | "Committee" | "Resolution" | "General";

export interface GlossaryTerm {
  term: string;
  definition: string;
  example: string;
  category: GlossaryCategory;
}

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  "Parliamentary",
  "Committee",
  "Resolution",
  "General",
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Parliamentary Procedure
  {
    term: "Motion",
    definition: "A formal proposal by a delegate that the committee take a certain action. Must be stated clearly and seconded before debate.",
    example: "\"I move that the committee enter into a moderated caucus.\"",
    category: "Parliamentary",
  },
  {
    term: "Second",
    definition: "Expression of support from another delegate that a motion be considered. Without a second, the motion fails.",
    example: "\"Second.\" (from the chair) — The chair acknowledges the second and proceeds to a vote.",
    category: "Parliamentary",
  },
  {
    term: "Moderated Caucus",
    definition: "A structured speaking period where the chair calls on delegates one by one to speak on a specific topic. The chair sets the time limit and total duration.",
    example: "\"I move for a moderated caucus of 20 minutes with 60-second speaking times on the topic of renewable energy subsidies.\"",
    category: "Parliamentary",
  },
  {
    term: "Unmoderated Caucus",
    definition: "An informal period where delegates may freely move around the room, negotiate, and form blocs. No formal speaking rules apply.",
    example: "\"I move for an unmoderated caucus of 15 minutes.\"",
    category: "Parliamentary",
  },
  {
    term: "Point of Order",
    definition: "A delegate's inquiry asserting that the rules of procedure have been violated. The chair rules on the point.",
    example: "\"Point of Order — the delegate just spoke for longer than the allotted time.\"",
    category: "Parliamentary",
  },
  {
    term: "Point of Personal Privilege",
    definition: "Raised when a delegate feels personally offended or misquoted. It is not a procedural motion but a request to correct a misstatement.",
    example: "\"Point of Personal Privilege — the delegate misquoted my country's position. I would like to clarify.\"",
    category: "Parliamentary",
  },
  {
    term: "Point of Procedure",
    definition: "A question raised about the correct interpretation or application of the rules of procedure.",
    example: "\"Point of Procedure — does the motion require a simple majority or two-thirds?\"",
    category: "Parliamentary",
  },
  {
    term: "Yield",
    definition: "When a speaker voluntarily gives up their remaining speaking time. Can yield to the chair, to another delegate, or to questions.",
    example: "\"I yield my remaining time to the delegate of France.\"",
    category: "Parliamentary",
  },
  {
    term: "Yield to Questions",
    definition: "A speaker yields the remainder of their time to allow other delegates to ask questions.",
    example: "\"I yield the remainder of my time to questions.\"",
    category: "Parliamentary",
  },
  {
    term: "Recess",
    definition: "A temporary suspension of the committee session. Delegates may leave the room but must return when the session resumes.",
    example: "\"I move for a 10-minute recess.\"",
    category: "Parliamentary",
  },
  {
    term: "Close Debate",
    definition: "A motion to end all discussion on a topic and proceed directly to voting on the draft resolution.",
    example: "\"I move to close debate and proceed to a vote on draft resolution 1.1.\"",
    category: "Parliamentary",
  },
  {
    term: "Set the Speaking Time",
    definition: "A motion to establish the time limit for each delegate's speech during moderated caucus or formal debate.",
    example: "\"I move to set the speaking time to 90 seconds.\"",
    category: "Parliamentary",
  },
  {
    term: "Roll Call Vote",
    definition: "A formal vote where each delegation's vote is recorded individually. Used in the General Assembly and for important resolutions.",
    example: "\"The committee requests a roll call vote on Operative Clause 5.\"",
    category: "Parliamentary",
  },
  {
    term: "By Voice Vote",
    definition: "A quick vote where delegates say \"aye\" or \"no\" simultaneously. The chair determines the outcome.",
    example: "\"Those in favor say 'aye.' Those opposed say 'no.' The ayes have it.\"",
    category: "Parliamentary",
  },
  {
    term: "Simple Majority",
    definition: "More than half of the votes cast. The standard voting threshold for most MUN decisions.",
    example: "\"The resolution passes with a simple majority of 24 votes in favor.\"",
    category: "Parliamentary",
  },
  {
    term: "Two-Thirds Majority",
    definition: "A supermajority requirement where at least two-thirds of votes must be in favor. Required for procedural motions and certain UN actions.",
    example: "\"The motion to suspend a delegate requires a two-thirds majority.\"",
    category: "Parliamentary",
  },
  {
    term: "Consensus",
    definition: "Agreement among all delegates without a formal vote. The preferred method of decision-making when possible.",
    example: "\"The chair notes that draft resolution 1.1 has been adopted by consensus.\"",
    category: "Parliamentary",
  },
  {
    term: "Quorum",
    definition: "The minimum number of delegates that must be present for the committee to conduct official business and vote.",
    example: "\"The chair confirms that a quorum of one-third of members is present.\"",
    category: "Parliamentary",
  },

  // Committee Structure & Roles
  {
    term: "Delegate",
    definition: "A participant representing a specific country in a committee session. Delegates advocate for their assigned country's position.",
    example: "\"The delegate of Germany delivered an excellent speech on climate policy.\"",
    category: "Committee",
  },
  {
    term: "Chair",
    definition: "The presiding officer of a committee session who enforces rules, recognizes speakers, and maintains order.",
    example: "\"The Chair recognized the delegate of Japan to speak.\"",
    category: "Committee",
  },
  {
    term: "Rapporteur",
    definition: "An officer responsible for recording and reporting the proceedings of the committee. In some committees, the rapporteur also introduces procedural motions.",
    example: "\"The Rapporteur presented the committee's report to the General Assembly.\"",
    category: "Committee",
  },
  {
    term: "Dais",
    definition: "The elevated platform where the chair and officers sit. Refers collectively to the committee leadership.",
    example: "\"The delegate addressed the dais before beginning their speech.\"",
    category: "Committee",
  },
  {
    term: "Sponsor",
    definition: "A delegate who has substantially contributed to drafting a working paper or draft resolution and is listed as an author.",
    example: "\"France is listed as a primary sponsor of Draft Resolution 1.2.\"",
    category: "Committee",
  },
  {
    term: "Signatory",
    definition: "A delegate who supports a working paper enough to see it developed into a draft resolution, but did not contribute to its drafting.",
    example: "\"Brazil has signed on as a signatory to Working Paper 3.\"",
    category: "Committee",
  },
  {
    term: "Bloc",
    definition: "A group of delegates who share similar positions and collaborate on drafting resolutions.",
    example: "\"The Nordic bloc proposed a joint operative clause on human rights.\"",
    category: "Committee",
  },
  {
    term: "Caucus",
    definition: "A gathering of delegates, either formal (moderated) or informal (unmoderated), for discussion and negotiation.",
    example: "\"The Western European group held a caucus during the unmoderated period.\"",
    category: "Committee",
  },
  {
    term: "Working Paper",
    definition: "An unofficial document proposed by delegates as a starting point for discussion. Not yet a formal draft resolution.",
    example: "\"Working Paper 4 addresses maritime security in the South China Sea.\"",
    category: "Committee",
  },
  {
    term: "Draft Resolution",
    definition: "A formal document containing the committee's proposed solutions, consisting of preamble and operative clauses. Subject to amendments and voting.",
    example: "\"Draft Resolution 1.1 was approved by the committee with 30 votes in favor.\"",
    category: "Committee",
  },
  {
    term: "Amendment",
    definition: "A proposed change to a draft resolution, either adding, deleting, or modifying clauses.",
    example: "\"The delegate of Canada proposed an amendment to add a new operative clause on refugee protections.\"",
    category: "Committee",
  },
  {
    term: "Merge",
    definition: "The process of combining two or more draft resolutions into a single document when they share similar goals.",
    example: "\"The committee voted to merge Draft Resolutions 1.1 and 1.3.\"",
    category: "Committee",
  },
  {
    term: "Preamble Clause",
    definition: "A clause in a draft resolution that provides context, background, and legal basis. Introduced with participle verbs (Reaffirming, Recalling, Noting).",
    example: "\"Reaffirming the purposes and principles of the Charter of the United Nations...\"",
    category: "Committee",
  },
  {
    term: "Operative Clause",
    definition: "A clause in a draft resolution that proposes specific actions. Numbered and introduced with imperative verbs (Decides, Calls upon, Urges).",
    example: "\"1. Calls upon all Member States to increase funding for climate adaptation programs.\"",
    category: "Committee",
  },
  {
    term: "General Speakers' List",
    definition: "A formal list of delegates who wish to speak on the topic during general debate. The chair calls on delegates in order.",
    example: "\"The Chair will now recognize delegates on the General Speakers' List.\"",
    category: "Committee",
  },
  {
    term: "Formal Session",
    definition: "An official committee meeting governed by strict parliamentary procedure. All speeches and votes are recorded.",
    example: "\"The committee will reconvene for a formal session at 2:00 PM.\"",
    category: "Committee",
  },
  {
    term: "Informal Session",
    definition: "A working session where delegates negotiate and draft without formal procedure. Also called 'informal negotiations.'",
    example: "\"During the informal session, blocs finalized their operative clauses.\"",
    category: "Committee",
  },
  {
    term: "Draft Committee",
    definition: "A committee session where delegates work on drafting and negotiating text before formal voting.",
    example: "\"The Draft Committee session focused on resolving disagreements over Clause 7.\"",
    category: "Committee",
  },

  // UN Documents & Terminology
  {
    term: "UN Charter",
    definition: "The foundational treaty of the United Nations, establishing the organization's structure, principles, and purposes.",
    example: "\"The preamble of the UN Charter begins with 'We the peoples of the United Nations...'\"",
    category: "Resolution",
  },
  {
    term: "Resolution",
    definition: "A formal expression of opinion or decision by a UN body. Resolutions can be binding (Security Council) or non-binding (General Assembly).",
    example: "\"UNGA Resolution 217A adopted the Universal Declaration of Human Rights in 1948.\"",
    category: "Resolution",
  },
  {
    term: "Directive",
    definition: "A resolution of the General Assembly or ECOSOC that is not legally binding but represents the body's recommendation.",
    example: "\"The General Assembly issued a directive on the protection of children in armed conflict.\"",
    category: "Resolution",
  },
  {
    term: "Treaty",
    definition: "A legally binding international agreement between states, governed by international law.",
    example: "\"The Paris Agreement on climate change was adopted in 2015.\"",
    category: "Resolution",
  },
  {
    term: "Convention",
    definition: "A formal agreement between states on a specific topic, typically open for widespread ratification.",
    example: "\"The Convention on the Rights of the Child has been ratified by 196 states.\"",
    category: "Resolution",
  },
  {
    term: "Protocol",
    definition: "An international agreement that supplements or amends an existing treaty or convention.",
    example: "\"The Kyoto Protocol set binding emission reduction targets for industrialized nations.\"",
    category: "Resolution",
  },
  {
    term: "Preamble",
    definition: "The introductory section of a UN resolution containing the reasoning and legal basis. Not legally binding but provides interpretive context.",
    example: "\"The preamble references General Assembly Resolution 60/1 on UN reform.\"",
    category: "Resolution",
  },
  {
    term: "Operative Clauses",
    definition: "The numbered action paragraphs of a resolution that constitute the binding or recommended decisions.",
    example: "\"Operative Clause 3 urges Member States to allocate 0.7% of GDP to development aid.\"",
    category: "Resolution",
  },
  {
    term: "Document Symbol",
    definition: "The alphanumeric code assigned to UN documents (e.g., A/RES/76/307 for a General Assembly resolution).",
    example: "\"S/RES/2254 (2015) is the Security Council resolution on Syria.\"",
    category: "Resolution",
  },
  {
    term: "Report of the Secretary-General",
    definition: "An official document submitted by the UN Secretary-General to the General Assembly or Security Council on specific topics.",
    example: "\"The Secretary-General's report on peacekeeping reform was submitted in March 2023.\"",
    category: "Resolution",
  },

  // General MUN
  {
    term: "Model United Nations",
    definition: "An educational simulation of the UN system where students represent countries, debate issues, and draft resolutions.",
    example: "\"She won Best Delegate at the Harvard MUN conference.\"",
    category: "General",
  },
  {
    term: "Position Paper",
    definition: "A formal document outlining a country's stance on committee topics. Submitted to the chair before the conference.",
    example: "\"The position paper of Norway addressed climate finance and loss-and-damage mechanisms.\"",
    category: "General",
  },
  {
    term: "Best Delegate",
    definition: "The highest individual award given to the delegate who demonstrates outstanding diplomacy, research, and leadership.",
    example: "\"The Best Delegate award went to the representative of South Korea.\"",
    category: "General",
  },
  {
    term: "Honorable Mention",
    definition: "An award recognizing a delegate's strong performance, typically second or third place.",
    example: "\"Three delegates received Honorable Mention awards at the closing ceremony.\"",
    category: "General",
  },
  {
    term: "Outstanding Delegate",
    definition: "An award recognizing exceptional performance, typically ranked below Best Delegate but above Honorable Mention.",
    example: "\"The delegate of Mexico received the Outstanding Delegate award.\"",
    category: "General",
  },
  {
    term: "Conference",
    definition: "A gathering of MUN delegates at a school, university, or international venue for debate and simulation.",
    example: "\"THIMUN is one of the largest MUN conferences in the world.\"",
    category: "General",
  },
  {
    term: "Committee",
    definition: "A specific UN body being simulated (e.g., General Assembly, Security Council, ECOSOC).",
    example: "\"She was assigned to the World Health Organization committee.\"",
    category: "General",
  },
  {
    term: "Topic",
    definition: "The agenda item or issue being debated in a committee session.",
    example: "\"The committee's first topic is the regulation of autonomous weapons systems.\"",
    category: "General",
  },
  {
    term: "Country Policy",
    definition: "The official position of a nation on a specific issue, shaped by its history, alliances, and national interests.",
    example: "\"Understanding China's country policy on Taiwan is essential for accurate representation.\"",
    category: "General",
  },
  {
    term: "Bloc Paper",
    definition: "A document outlining the shared positions and proposed solutions of a bloc of like-minded countries.",
    example: "\"The EU bloc paper recommended a phased approach to carbon taxation.\"",
    category: "General",
  },
  {
    term: "Chairs' Report",
    definition: "A summary document prepared by committee chairs describing the proceedings, decisions, and outcomes of the session.",
    example: "\"The Chairs' Report highlighted the committee's consensus on the peacekeeping resolution.\"",
    category: "General",
  },
  {
    term: "Rules of Procedure",
    definition: "The formal rules governing how a committee conducts its business, including motions, voting, and speaking order.",
    example: "\"The THIMUN Rules of Procedure differ from those used at Harvard MUN.\"",
    category: "General",
  },
  {
    term: "Chair's Ruling",
    definition: "A decision made by the chair on a point of order or procedural question. Binding unless overturned by the committee.",
    example: "\"The Chair ruled that the motion was out of order.\"",
    category: "General",
  },
  {
    term: "Closing Ceremony",
    definition: "The final event of an MUN conference where awards are presented and speeches are delivered.",
    example: "\"The closing ceremony featured a keynote address by the Secretary-General.\"",
    category: "General",
  },
  {
    term: "Opening Ceremony",
    definition: "The inaugural event of an MUN conference, often featuring keynote speakers and the introduction of committee topics.",
    example: "\"The opening ceremony was attended by over 2,000 delegates.\"",
    category: "General",
  },
  {
    term: "Secretary-General",
    definition: "The student leader of an MUN conference, responsible for overall organization and oversight.",
    example: "\"The Secretary-General addressed the delegates during the opening ceremony.\"",
    category: "General",
  },
  {
    term: "Under-Secretary-General",
    definition: "A senior student officer in an MUN conference, typically overseeing specific committees or divisions.",
    example: "\"The USG for GA1 managed all First Committee proceedings.\"",
    category: "General",
  },
  {
    term: "Director",
    definition: "The student officer who chairs a specific committee session, responsible for enforcing rules and managing debate.",
    example: "\"The Director of DISEC led the debate on nuclear non-proliferation.\"",
    category: "General",
  },
  {
    term: "Crisis Staff",
    definition: "A team that manages real-time crisis scenarios in Crisis Committees, providing updates and challenges.",
    example: "\"The crisis staff released an update on the escalating conflict in the simulation.\"",
    category: "General",
  },
  {
    term: "Directive",
    definition: "In a Crisis Committee, an action submitted by a delegate to influence the crisis scenario.",
    example: "\"The delegate of Russia submitted a directive to deploy peacekeeping forces.\"",
    category: "General",
  },
  {
    term: "Update",
    definition: "A real-time development in a Crisis Committee, introducing new events or challenges for delegates to respond to.",
    example: "\"Update 3.2: A natural disaster has struck the capital city.\"",
    category: "General",
  },
  {
    term: "Backroom",
    definition: "The team of advisors and staff who support the crisis staff in Crisis Committees.",
    example: "\"The backroom prepared a detailed briefing on the historical context of the crisis.\"",
    category: "General",
  },
  {
    term: "Faci",
    definition: "Short for 'facilitator,' a junior staff member who assists with logistics and delegate support.",
    example: "\"The faci distributed position papers to all delegates before the session.\"",
    category: "General",
  },
];

export const ALL_GLOSSARY_LETTERS = Array.from(
  new Set(GLOSSARY_TERMS.map((t) => t.term[0].toUpperCase()))
).sort();
