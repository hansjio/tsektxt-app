export const brand = {
  name: "tsek.",
  descriptor: "TsekTxt research demo",
  tagline: "Think before you share.",
  description: "Local research demo of three Taglish election-misinformation models, side by side, with Integrated Gradients word highlights.",
  disclaimer:
    "Research demo, not a fact-checker. Labels follow the source (fact-checkers and news outlets), so a verdict says how a post resembles what those sources labelled, not whether it is true. Each model was trained once (single seed). The models are not ranked: the difference between RoBERTa-Tagalog and XLM-RoBERTa was not statistically significant.",
  // INVENTED test text for trying the demo. NOT real posts and not part of any dataset.
  samples: [
    "Totoo ba na pinalitan na raw ang resulta ng bilangan sa precinct namin kagabi? Share niyo na agad ito bago nila burahin.",
    "Ayon sa abiso ng election office, bukas ang voter registration hanggang katapusan ng buwan. Dalhin ang valid ID sa inyong local office.",
  ],
  // REAL public posts (news outlets / official account, 2022) from the collected candidate set, each with its source link.
  // No label is shown or implied: the Taglish set is test-only and its labels are not final.
  examples: [
  {
    name: "Example: news report, 10 words",
    source: "ABS-CBN News (X)",
    url: "https://x.com/ABSCBNNews/status/1510848386475311105",
    text: "Comelec eyes debate skipping as basis for candidate disqualification #Halalan2022",
  },
  {
    name: "Example: news report, Filipino, 16 words",
    source: "dzBB (X)",
    url: "https://x.com/dzbb/status/1523091909262004224",
    text: "#Eleksyon2022: Ilang mga nagsimba sa Pasig Cathedral ngayong Linggo, ipinanalangin ang payapang eleksyon. | via \n@MMakalalad",
  },
  {
    name: "Example: official account notice, 23 words",
    source: "COMELEC (X)",
    url: "https://twitter.com/COMELEC/status/1522093742202707968",
    text: "Fully shade the oval to the LEFT of your candidate's name.\n\nDo NOT make any other mark on the ballot.#VoteSAFEPilipinas #BumotoKa #NLE2022 pic.twitter.com/g2t1EJLcTP",
  },
  {
    name: "Example: news report, Taglish, 46 words",
    source: "ABS-CBN News (X)",
    url: "https://x.com/ABSCBNNews/status/1523447780689080320",
    text: "NOW: Comelec holds press briefing over an hour after polls opened.\n\n“As early as 6 am marami na tayong kababayang nagpunta sa polling places… Tuloy ang botohan ano man ang mangyari, we have plans B, C, & other contingency plans,” says acting spox John Laudiangco. #Halalan2022",
  },
  {
    name: "Example: news report, list, 48 words",
    source: "GMA News (X)",
    url: "https://x.com/gmanews/status/1523494357898493953",
    text: "JUST IN: Comelec Commissioner George Garcia says more than 1,800 VCMs have malfunctioned. \n\nCommon issues [but resolved]\n- Paper Jam - 940\n- Rejected ballots - 606\n- VCM scanner - 158\n- VCM printer not printing - 87\n- Not printing properly -76 #Eleksyon2022 | via \n@tinapperez",
  },
  ],
};
