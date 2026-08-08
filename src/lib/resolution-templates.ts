export type ResolutionCategory =
  | "Security Council"
  | "General Assembly"
  | "ECOSOC"
  | "Human Rights Council"
  | "UNCLOS"
  | "UNEP";

export interface ResolutionTemplate {
  id: string;
  title: string;
  committee: ResolutionCategory;
  topic: string;
  documentSymbol: string;
  description: string;
  formattingGuide: string;
  preambleClauses: string[];
  operativeClauses: string[];
}

export const RESOLUTION_CATEGORIES: ResolutionCategory[] = [
  "Security Council",
  "General Assembly",
  "ECOSOC",
  "Human Rights Council",
  "UNCLOS",
  "UNEP",
];

export const RESOLUTION_TEMPLATES: ResolutionTemplate[] = [
  {
    id: "unsc-ceasefire",
    title: "Demand for Ceasefire in Armed Conflict",
    committee: "Security Council",
    topic: "International Peace and Security",
    documentSymbol: "S/RES/XXXX (2026)",
    description:
      "A comprehensive ceasefire resolution demanding immediate cessation of hostilities, deployment of monitors, and humanitarian access. Modelled on UNSC Resolution 2254 (2015) and Resolution 2712 (2023).",
    formattingGuide:
      "UNSC resolutions use numbered paragraphs. Preambulatory clauses reference the UN Charter, prior resolutions, and reports of the Secretary-General. Operative clauses use imperative verbs: demands, calls upon, decides, requests, demands.",
    preambleClauses: [
      "Reaffirming the purposes and principles of the Charter of the United Nations, particularly the obligation of Member States to settle their disputes by peaceful means,",
      "Recalling resolution 2254 (2015) and all relevant subsequent resolutions on the situation,",
      "Expressing grave concern at the continued deterioration of the humanitarian situation and the immense human suffering,",
      "Deeply alarmed by the reports of widespread violations of international humanitarian law and international human rights law,",
      "Acknowledging the efforts of the Secretary-General and his Special Envoy in facilitating dialogue,",
      "Taking note of the report of the Secretary-General on the situation (S/2026/XXX),",
      "Reaffirming its primary responsibility under the Charter with respect to the maintenance of international peace and security,",
    ],
    operativeClauses: [
      "Demands an immediate and comprehensive ceasefire to be respected by all parties to the conflict,",
      "Demands the full, safe, and unhindered delivery of humanitarian assistance to all civilians in need,",
      "Calls upon all parties to the conflict to allow rapid, safe, and unimpeded passage of humanitarian relief,",
      "Decides to deploy a multinational monitoring force under United Nations authority to verify compliance with the ceasefire,",
      "Requests the Secretary-General to report to the Council on a monthly basis on the implementation of this resolution,",
      "Calls upon all Member States to support the ceasefire and refrain from actions that could undermine the peace process,",
      "Decides to remain seized of the matter,",
    ],
  },
  {
    id: "unga-climate",
    title: "Enhanced Action on Climate Change and Sustainable Development",
    committee: "General Assembly",
    topic: "Climate Action",
    documentSymbol: "A/RES/XXXX (2026)",
    description:
      "A General Assembly resolution addressing the urgency of climate action, calling for enhanced nationally determined contributions, climate finance, and support for developing countries. Modelled on UNGA Resolution 76/300 (2022) recognizing the right to a clean environment.",
    formattingGuide:
      "GA resolutions are less binding than UNSC resolutions but carry significant moral weight. Preambulatory clauses reference prior GA resolutions, IPCC reports, and the Paris Agreement. Operative clauses use encourages, urges, calls upon, requests.",
    preambleClauses: [
      "Recalling the Paris Agreement adopted under the United Nations Framework Convention on Climate Change,",
      "Recalling also General Assembly resolution 76/300 on the human right to a clean, healthy, and sustainable environment,",
      "Taking note of the Sixth Assessment Report of the Intergovernmental Panel on Climate Change,",
      "Acknowledging the disproportionate impact of climate change on developing countries, small island developing States, and least developed countries,",
      "Recognizing the urgent need to enhance ambition and action to limit the global temperature increase to 1.5 degrees Celsius,",
      "Welcoming the outcomes of the twenty-eighth Conference of the Parties to the UNFCCC,",
    ],
    operativeClauses: [
      "Urges all States to submit enhanced nationally determined contributions aligned with the 1.5-degree Celsius goal by 2027,",
      "Calls upon developed countries to meet the collective goal of mobilizing USD 100 billion per year for climate action in developing countries,",
      "Encourages all Member States to integrate climate adaptation into national development planning,",
      "Requests the United Nations Framework Convention on Climate Change to provide technical assistance to developing countries,",
      "Calls for the operationalization and full capitalization of the Loss and Damage Fund established at COP27,",
      "Invites the Secretary-General to convene a Climate Ambition Summit before the end of 2027,",
      "Decides to continue considering the matter and to conduct a comprehensive review of progress in 2028,",
    ],
  },
  {
    id: "ecosoc-sustainable-dev",
    title: "Implementation of the 2030 Agenda for Sustainable Development",
    committee: "ECOSOC",
    topic: "Sustainable Development",
    documentSymbol: "E/RES/XXXX (2026)",
    description:
      "An ECOSOC resolution focused on accelerating progress toward the Sustainable Development Goals, addressing financing gaps, data gaps, and multi-stakeholder partnerships. Modelled on E/RES/2021/1 on the Decade of Action.",
    formattingGuide:
      "ECOSOC resolutions address economic and social matters. Preambulatory clauses reference the 2030 Agenda, prior ECOSOC decisions, and reports of subsidiary bodies. Operative clauses are action-oriented and often request reports or establish working groups.",
    preambleClauses: [
      "Reaffirming the 2030 Agenda for Sustainable Development and its commitment to leave no one behind,",
      "Recalling General Assembly resolution 70/1 of 25 September 2015 and ECOSOC resolution 2021/1,",
      "Taking note of the Sustainable Development Goals Report 2026, which indicates significant shortfalls in progress across most Goals,",
      "Acknowledging that the COVID-19 pandemic and ongoing global crises have reversed years of development gains,",
      "Recognizing the critical role of financing for sustainable development and the need to close the annual investment gap,",
      "Emphasizing the importance of effective data collection and monitoring to inform evidence-based policy,",
    ],
    operativeClauses: [
      "Calls upon Member States to mainstream the Sustainable Development Goals into national budgets and development strategies,",
      "Encourages the development of innovative financing mechanisms, including blended finance and sustainable debt instruments,",
      "Requests the Secretary-General to produce a progress report on the SDGs for consideration at the 2027 high-level political forum,",
      "Invites all stakeholders, including the private sector and civil society, to contribute to the acceleration of the Sustainable Development Goals,",
      "Decides to strengthen the capacity of the United Nations statistical system to support data collection and reporting,",
      "Calls upon international financial institutions to align their lending practices with the 2030 Agenda,",
    ],
  },
  {
    id: "unhcr-refugee",
    title: "Protection of Refugees and Stateless Persons",
    committee: "Human Rights Council",
    topic: "Refugee Protection",
    documentSymbol: "A/HRC/RES/XXXX (2026)",
    description:
      "A Human Rights Council resolution addressing the global refugee crisis, calling for burden-sharing, respect for non-refoulement, and durable solutions. Modelled on HRC Resolution 44/1 on the rights of refugees.",
    formattingGuide:
      "HRC resolutions focus on human rights obligations. Preambulatory clauses cite international human rights law, the 1951 Refugee Convention, and reports of the UNHCR. Operative clauses call upon, urges, encourages, and requests.",
    preambleClauses: [
      "Reaffirming the Universal Declaration of Human Rights and the foundational principles of international refugee protection,",
      "Recalling the Convention relating to the Status of Refugees of 1951 and its 1967 Protocol,",
      "Recalling also Human Rights Council resolution 44/1 on the rights of refugees and internally displaced persons,",
      "Gravely concerned by the fact that over 110 million people worldwide have been forcibly displaced,",
      "Emphasizing the principle of non-refoulement as a cornerstone of international refugee law,",
      "Recognizing the significant contribution of host communities and developing countries that shelter the majority of the world's refugees,",
    ],
    operativeClauses: [
      "Calls upon all States to uphold the principle of non-refoulement and to ensure the protection of refugees within their jurisdictions,",
      "Urges the international community to increase financial support to UNHCR and host countries,",
      "Encourages States to implement local integration and resettlement programmes as durable solutions for refugees,",
      "Requests the Office of the United Nations High Commissioner for Human Rights to monitor and report on the human rights of refugees and stateless persons,",
      "Calls upon the General Assembly to consider establishing a global refugee compact to ensure fair burden- and responsibility-sharing,",
      "Encourages States to facilitate access to education, healthcare, and employment for refugees,",
      "Decides to continue addressing the situation and to hold an interactive dialogue at its next session,",
    ],
  },
  {
    id: "who-pandemic",
    title: "Preparedness for and Response to Pandemic Health Threats",
    committee: "General Assembly",
    topic: "Global Health Security",
    documentSymbol: "A/RES/XXXX (2026)",
    description:
      "A resolution addressing pandemic preparedness, equitable access to vaccines and therapeutics, and strengthening of the World Health Organization. Modelled on UNGA Resolution 75/268 on global health security.",
    formattingGuide:
      "Health-related GA resolutions draw on WHO Constitution and International Health Regulations. Preambulatory clauses reference WHO reports and prior GA resolutions on global health. Operative clauses urge, call upon, and request.",
    preambleClauses: [
      "Reaffirming the right of all peoples to the enjoyment of the highest attainable standard of physical and mental health,",
      "Recalling the International Health Regulations (2005) and General Assembly resolution 75/268,",
      "Noting with concern that the world remains unprepared for future pandemic threats,",
      "Acknowledging the devastating social and economic impact of recent pandemics on all countries,",
      "Recognizing the critical role of the World Health Organization in coordinating global health responses,",
      "Emphasizing the importance of equity in access to vaccines, diagnostics, and therapeutics,",
    ],
    operativeClauses: [
      "Calls upon all Member States to strengthen national pandemic preparedness plans in line with the International Health Regulations,",
      "Encourages the equitable and timely sharing of pathogen data and genomic sequences through established international mechanisms,",
      "Urges developed countries to support the WHO Hub for Pandemic and Epidemic Intelligence,",
      "Requests the Director-General of the World Health Organization to present a report on global preparedness at the next World Health Assembly,",
      "Calls for the establishment of a global fund for pandemic preparedness and response,",
      "Encourages multi-stakeholder partnerships to accelerate research and development of countermeasures against pandemic threats,",
      "Decides to convene a high-level meeting on global health security no later than 2028,",
    ],
  },
  {
    id: "disec-nonproliferation",
    title: "Strengthening the Nuclear Non-Proliferation Regime",
    committee: "General Assembly",
    topic: "Disarmament and Non-Proliferation (DISEC)",
    documentSymbol: "A/RES/XXXX (2026)",
    description:
      "A DISEC resolution addressing nuclear non-proliferation, calling for universalization of the NPT, entry into force of the CTBT, and progress on nuclear disarmament. Modelled on GA Resolution 77/65 on the NPT.",
    formattingGuide:
      "Disarmament resolutions in the First Committee reference the NPT, CTBT, and bilateral arms control treaties. Preambulatory clauses cite prior GA resolutions and reports of the Conference on Disarmament. Operative clauses use calls upon, urges, invites.",
    preambleClauses: [
      "Reaffirming the Treaty on the Non-Proliferation of Nuclear Weapons as the cornerstone of the global non-proliferation regime,",
      "Recalling General Assembly resolution 77/65 on the Treaty on the Non-Proliferation of Nuclear Weapons,",
      "Noting with concern the continued existence of approximately 12,500 nuclear warheads worldwide,",
      "Recognizing the catastrophic humanitarian consequences of any use of nuclear weapons,",
      "Emphasizing the need for the universalization of the Non-Proliferation Treaty,",
      "Taking note of the report of the International Atomic Energy Agency on verification activities,",
    ],
    operativeClauses: [
      "Calls upon all States not party to the Treaty on the Non-Proliferation of Nuclear Weapons to accede to the Treaty without delay and without conditions,",
      "Urges the remaining states to sign and ratify the Comprehensive Nuclear-Test-Ban Treaty,",
      "Encourages nuclear-weapon States to report on their progress toward fulfilling disarmament obligations under Article VI of the NPT,",
      "Requests the Secretary-General to prepare a report on the implementation of this resolution for the next session of the General Assembly,",
      "Calls upon the Conference on Disarmament to agree on a comprehensive programme of work, including negotiations on a Fissile Material Cut-off Treaty,",
      "Encourages confidence-building measures and transparency in defence planning among nuclear-weapon States,",
      "Decides to convene the next session of the Conference on Disarmament to discuss progress,",
    ],
  },
  {
    id: "unsc-peacekeeping",
    title: "Authorization and Mandate of a Peacekeeping Operation",
    committee: "Security Council",
    topic: "Peacekeeping Operations",
    documentSymbol: "S/RES/XXXX (2026)",
    description:
      "A Security Council resolution establishing a new peacekeeping operation with a mandate for civilian protection, disarmament, demobilization, and reintegration. Modelled on UNSC Resolution 2259 (2015) and UNSMIL mandates.",
    formattingGuide:
      "UNSC peacekeeping resolutions use operative verbs: authorizes, decides, requests, calls upon. They typically mandate the Secretary-General to establish a mission for a defined period and set out the force structure and rules of engagement.",
    preambleClauses: [
      "Reaffirming the purposes and principles of the Charter of the United Nations,",
      "Recalling all its relevant resolutions on peacekeeping operations, in particular resolution 2259 (2015),",
      "Expressing concern at the deteriorating security situation and the threat it poses to stability and civilian populations,",
      "Welcoming the efforts of the Secretary-General and his Special Representative,",
      "Noting the recommendation of the Secretary-General to establish a peacekeeping operation,",
      "Determined to ensure the protection of civilians and to support the political process,",
    ],
    operativeClauses: [
      "Authorizes the establishment of a United Nations peacekeeping operation for an initial period of twelve months,",
      "Decides that the operation shall have a military component of up to 15,000 personnel and a police component of up to 1,500,",
      "Requests the Secretary-General to appoint a Special Representative of the Secretary-General to lead the operation,",
      "Authorizes the peacekeeping operation to use all necessary means to protect civilians under imminent threat of physical violence,",
      "Calls upon all parties to the conflict to allow full, safe, and unhindered access for humanitarian assistance,",
      "Requests the Secretary-General to report to the Council every 90 days on the implementation of this resolution,",
      "Decides to review the mandate no later than six months after the deployment of the operation,",
    ],
  },
  {
    id: "unga-human-rights",
    title: "Promotion and Protection of Human Rights",
    committee: "General Assembly",
    topic: "Human Rights",
    documentSymbol: "A/RES/XXXX (2026)",
    description:
      "A General Assembly resolution on the promotion and protection of human rights, addressing freedom of expression, digital rights, and the role of civil society. Modelled on GA Resolution 76/221 on the right to privacy in the digital age.",
    formattingGuide:
      "GA human rights resolutions draw on the UDHR, ICCPR, ICESCR, and regional instruments. Preambulatory clauses cite treaty bodies, special procedures, and UPR recommendations. Operative clauses call upon, urges, encourages, requests.",
    preambleClauses: [
      "Reaffirming the Universal Declaration of Human Rights and the International Covenants on Civil and Political Rights and on Economic, Social and Cultural Rights,",
      "Recalling General Assembly resolution 76/221 on the right to privacy in the digital age,",
      "Recognizing the importance of freedom of expression, including through digital means, as a fundamental human right,",
      "Deeply concerned about the increasing restrictions on civic space and the shrinking room for civil society globally,",
      "Noting the impact of emerging technologies, including artificial intelligence, on the enjoyment of human rights,",
      "Acknowledging the role of national human rights institutions in the promotion and protection of human rights,",
    ],
    operativeClauses: [
      "Calls upon all Member States to respect and protect the rights to freedom of opinion and expression, including in the digital environment,",
      "Urges States to refrain from imposing unlawful restrictions on the work of civil society organizations and human rights defenders,",
      "Encourages the development of regulatory frameworks for artificial intelligence that are consistent with international human rights law,",
      "Requests the Office of the High Commissioner for Human Rights to prepare a report on the human rights implications of digital technologies,",
      "Calls upon States to strengthen the independence and effectiveness of national human rights institutions,",
      "Encourages Member States to ratify the Optional Protocol to the International Covenant on Economic, Social and Cultural Rights,",
      "Decides to continue its consideration of the matter at its next session,",
    ],
  },
  {
    id: "unclos-maritime",
    title: "Settlement of Maritime Disputes and UNCLOS Compliance",
    committee: "General Assembly",
    topic: "Law of the Sea (UNCLOS)",
    documentSymbol: "A/RES/XXXX (2026)",
    description:
      "A resolution addressing maritime disputes, freedom of navigation, and compliance with the United Nations Convention on the Law of the Sea. Modelled on GA Resolution 77/248 on oceans and the law of the sea.",
    formattingGuide:
      "UNCLOS-related resolutions reference the Convention and its implementing agreements. Preambulatory clauses cite the text of UNCLOS, ITLOS decisions, and ICJ jurisprudence. Operative clauses call upon, urges, encourages.",
    preambleClauses: [
      "Reaffirming that the United Nations Convention on the Law of the Sea of 10 December 1982 establishes the legal framework within which all activities in the oceans and seas must be carried out,",
      "Recalling General Assembly resolution 77/248 on oceans and the law of the sea,",
      "Noting with concern the increasing number of disputes relating to maritime boundaries, exclusive economic zones, and continental shelf entitlements,",
      "Recognizing the importance of peaceful settlement of disputes in accordance with Part XV of UNCLOS,",
      "Emphasizing the vital role of the International Tribunal for the Law of the Sea in the settlement of maritime disputes,",
      "Acknowledging the importance of preserving marine biodiversity in areas beyond national jurisdiction,",
    ],
    operativeClauses: [
      "Calls upon all States Parties to the Convention to settle their maritime disputes through the dispute settlement mechanisms provided for in Part XV of the Convention,",
      "Urges States to exercise restraint in activities that could escalate tensions in disputed maritime areas,",
      "Encourages States to cooperate in the conservation and sustainable use of marine biodiversity beyond national jurisdiction,",
      "Requests the International Tribunal for the Law of the Sea to report on its activities to the General Assembly,",
      "Calls upon States to implement the BBNJ Agreement and to support its entry into force,",
      "Encourages capacity-building and technical assistance to developing States in the implementation of UNCLOS,",
      "Decides to continue examining the issue of oceans and the law of the sea at its next session,",
    ],
  },
  {
    id: "unep-environmental",
    title: "Combating Pollution and Protecting the Global Environment",
    committee: "General Assembly",
    topic: "Environmental Protection",
    documentSymbol: "A/RES/XXXX (2026)",
    description:
      "A resolution addressing environmental pollution, chemical waste, plastic pollution, and the transition to a circular economy. Modelled on GA Resolution 78/234 on the International Day of Clean Air.",
    formattingGuide:
      "Environmental GA resolutions reference UNEP assessments, the Basel Convention, and multilateral environmental agreements. Preambulatory clauses cite IPCC, IPBES, and UNEP reports. Operative clauses call upon, urges, invites, encourages.",
    preambleClauses: [
      "Reaffirming the right of all peoples to a clean, healthy, and sustainable environment,",
      "Recalling General Assembly resolution 76/300 on the human right to a clean, healthy, and sustainable environment,",
      "Taking note of the United Nations Environment Programme Frontiers report on emerging environmental issues,",
      "Expressing deep concern at the estimated 9 million premature deaths annually attributable to air pollution,",
      "Noting with concern the growing crisis of plastic pollution in marine and terrestrial environments,",
      "Recognizing the need for a global treaty on plastic pollution to complement existing multilateral environmental agreements,",
    ],
    operativeClauses: [
      "Calls upon all Member States to adopt and implement national air quality standards in line with World Health Organization guidelines,",
      "Urges States to accelerate the transition to a circular economy and to reduce waste generation through sustainable production and consumption patterns,",
      "Encourages the finalization and adoption of a legally binding global treaty on plastic pollution by 2027,",
      "Requests the United Nations Environment Programme to provide technical assistance to developing countries in pollution control and prevention,",
      "Calls for the integration of pollution reduction targets into nationally determined contributions under the Paris Agreement,",
      "Invites the private sector to adopt sustainable business practices and to report on their environmental impact,",
      "Decides to convene a high-level meeting on pollution and the environment before the end of 2027,",
    ],
  },
  {
    id: "unga-sustainable-dev-summit",
    title: "Financing the 2030 Agenda and the SDG Stimulus",
    committee: "General Assembly",
    topic: "Development Finance",
    documentSymbol: "A/RES/XXXX (2026)",
    description:
      "A resolution on mobilizing financing for sustainable development, addressing debt distress, reforming the international financial architecture, and scaling up development cooperation. Modelled on UNGA Resolution 77/296 on the SDG Stimulus.",
    formattingGuide:
      "Development finance resolutions reference the Addis Ababa Action Agenda, SDG financing framework, and IFI reform. Preambulatory clauses cite World Bank, IMF, and UNCTAD reports. Operative clauses call upon, urges, encourages, requests.",
    preambleClauses: [
      "Reaffirming the Addis Ababa Action Agenda on Financing for Development,",
      "Recalling General Assembly resolution 77/296 on the SDG Stimulus for accelerating the implementation of the Sustainable Development Goals,",
      "Taking note of the World Bank and IMF assessments indicating that developing countries face a financing gap of USD 4.2 trillion annually,",
      "Expressing concern at the rising debt distress in developing countries, with over 60 per cent of low-income countries in or at high risk of debt distress,",
      "Recognizing the urgent need to reform the international financial architecture to make it more inclusive and responsive,",
      "Emphasizing the role of domestic resource mobilization as a cornerstone of sustainable development finance,",
    ],
    operativeClauses: [
      "Calls upon the international financial institutions to reform their governance and lending frameworks to better serve developing countries,",
      "Urges creditor nations and private creditors to participate in fair and transparent debt relief mechanisms,",
      "Encourages developing countries to strengthen domestic tax systems and improve the efficiency of public financial management,",
      "Requests the Secretary-General to prepare a report on innovative financing mechanisms for the Sustainable Development Goals,",
      "Calls for the scaling up of concessional finance and blended finance instruments for the most vulnerable countries,",
      "Invites the Development Cooperation Forum to review the effectiveness of development cooperation in supporting the 2030 Agenda,",
      "Decides to hold a high-level dialogue on SDG financing at its next session,",
    ],
  },
  {
    id: "unsc-children-armed-conflict",
    title: "Protection of Children in Armed Conflict",
    committee: "Security Council",
    topic: "Child Protection",
    documentSymbol: "S/RES/XXXX (2026)",
    description:
      "A Security Council resolution addressing the recruitment and use of children by armed forces and armed groups, attacks on schools and hospitals, and the need for accountability. Modelled on UNSC Resolution 1612 (2005) and Resolution 2427 (2018).",
    formattingGuide:
      "UNSC child protection resolutions reference the Convention on the Rights of the Child and its Optional Protocol. Preambulatory clauses cite reports of the Secretary-General on children and armed conflict. Operative clauses demand, calls upon, decides.",
    preambleClauses: [
      "Reaffirming the Convention on the Rights of the Child and its Optional Protocol on the involvement of children in armed conflict,",
      "Recalling all its relevant resolutions on children and armed conflict, in particular resolutions 1612 (2005) and 2427 (2018),",
      "Deeply concerned about the persistent and increasing grave violations against children in armed conflict, including recruitment, killing and maiming, abduction, and attacks on schools and hospitals,",
      "Acknowledging the important role of the Special Representative of the Secretary-General for Children and Armed Conflict,",
      "Stressing the importance of accountability for violations against children in armed conflict,",
      "Noting the continued relevance of the Monitoring and Reporting Mechanism established by Security Council resolution 1612 (2005),",
    ],
    operativeClauses: [
      "Demands that all parties to armed conflict immediately cease the recruitment and use of children in violation of applicable international law,",
      "Calls upon all parties to conflict to ensure the safe, unimpeded, and immediate access of humanitarian organizations to children,",
      "Decides that the Monitoring and Reporting Mechanism shall continue to document and report on all grave violations against children,",
      "Requests the Secretary-General to include in his annual report on children and armed conflict the names of persistent violators,",
      "Calls upon Member States to ensure accountability for crimes against children by establishing national accountability mechanisms,",
      "Encourages Member States to provide reintegration programmes for children released from armed forces and armed groups,",
      "Decides to remain actively seized of the matter and to review the effectiveness of the Monitoring and Reporting Mechanism,",
    ],
  },
];
