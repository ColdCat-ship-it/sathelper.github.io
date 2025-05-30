import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, useMatches, useActionData, useLoaderData, useParams, useRouteError, Meta, Links, ScrollRestoration, Scripts, Outlet, isRouteErrorResponse } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createElement, useState, useEffect } from "react";
import { Mic, StopCircle } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import ReactMarkdown from "react-markdown";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
function withErrorBoundaryProps(ErrorBoundary3) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      error: useRouteError()
    };
    return createElement(ErrorBoundary3, props);
  };
}
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const home = withComponentProps(function SATApp() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [writingAnswer, setWritingAnswer] = useState("");
  const [audioURL, setAudioURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [aiFeedback, setAIFeedback] = useState(null);
  const [showReviewIntro, setShowReviewIntro] = useState(true);
  const [highlight, setHighlight] = useState("");
  const [aiExplanation, setAIExplanation] = useState("");
  const [subpoints, setSubpoints] = useState([]);
  const [subExplanation, setSubExplanation] = useState("");
  const [displayedMarkdown, setDisplayedMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [debriefAudio, setDebriefAudio] = useState(null);
  const [audioRef, setAudioRef] = useState(null);
  const [tagScores, setTagScores] = useState({});
  const englishTags = ["Main Idea", "Character Analysis", "Figurative Language", "Theme", "Grammar and Conventions"];
  const mathTags = ["Linear Equations", "Ratio and Proportions", "Unit Conversion", "Coordinate Geometry"];
  const questions = [{
    type: "multiple-choice",
    tags: ["Figurative Language", "Theme"],
    passage: "The following text is from Ezra Pound’s 1909 poem “Hymn III,” based on the work of Marcantonio Flaminio.\n > As a fragile and lovely flower unfolds its gleaming foliage on the breast of the fostering earth, if the dew and the rain draw it forth;\n> > So doth my tender mind flourish, if it be fed with the sweet dew of the fostering spirit,\n> > Lacking this, it beginneth straightway to languish, even as a floweret born upon dry earth, if the dew and the rain tend it not.\n>",
    question: "Based on the text, in what way is the human mind like a flower?",
    options: ["A)	It becomes increasingly vigorous with the passage of time.", "B)	It draws strength from changes in the weather.", "C)	It requires proper nourishment in order to thrive.", "D)	It perseveres despite challenging circumstances.\n"],
    correctAnswer: "C",
    explanation: "Choice C is the best answer because it presents a description of how the human mind is like a flower that is directly supported by the text. The text compares the needs of a “fragile and lovely flower” to those of the speaker’s “tender mind”: both need to be fed if they’re going to survive. Without such feeding, they’ll “beginneth straightway to languish,” or weaken. Thus, the text suggests that the human mind is like a flower in that they both need proper nourishment in order to thrive.\nChoice A is incorrect because the text doesn’t address the passage of time or describe either the human mind or a flower as becoming increasingly vigorous. Choice B is incorrect because the text doesn’t suggest that human minds or flowers draw strength from changes in weather. The references to rain in the text pertain to a flower’s need for water rather than the general effects of changing weather. Choice D is incorrect because the text doesn’t suggest that the human mind or a flower will persist regardless of challenging circumstances. In fact, the text indicates that they’ll both languish right away if not given what they need.\n"
  }, {
    type: "multiple-choice",
    tags: ["Main Idea", "Character Analysis"],
    passage: ' \nThe following text is adapted from Frances Hodgson Burnett’s 1911 novel The Secret Garden. Mary, a young girl, recently found an overgrown hidden garden.\n> "Mary was an odd, determined little person, and now she had something interesting to be\n> determined about, she was very much absorbed, indeed. She worked and dug and pulled up weeds steadily, only becoming more pleased with her work every hour instead of tiring of it. It seemed to her like a fascinating sort of play.\n"',
    question: "Which choice best states the main idea of the text?",
    options: ["A)	Mary hides in the garden to avoid doing her chores.\n", "B)	Mary is getting bored with pulling up so many weeds in the garden.\n", "C)	Mary is clearing out the garden to create a space to play.\n", "D)	Mary feels very satisfied when she’s taking care of the garden.\n"],
    correctAnswer: "D",
    explanation: "Choice D is the best answer because it most accurately states the main idea of the text. The text describes Mary’s activities in an overgrown hidden garden,\nsaying that she was “very much absorbed” and was “only becoming more pleased with her work every hour” rather than getting tired of it. She also thinks of garden activities as a “fascinating sort of play.” Thus, the main idea of the text is that Mary feels very satisfied when taking care of the garden.\nChoice A is incorrect because the text never makes any mention of Mary’s chores. Choice B is incorrect because the text indicates that Mary finds pulling up weeds to be fascinating, not boring. Choice C is incorrect because Mary thinks of garden activities in and of themselves as play, not as something necessary to do to create a space to play.\n"
  }, {
    type: "multiple-choice",
    tags: ["Grammar and Conventions"],
    passage: " \nLike other amphibians, the wood frog (Rana sylvatica) is unable to generate its own heat, so during periods of subfreezing temperatures, it ______ by producing large amounts of glucose, a sugar that helps prevent damaging ice from forming inside its cells.\n",
    question: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["A)	had survived\n", "B)	survived\n", "C)	would survive\n", "D)	survives\n"],
    correctAnswer: "D",
    explanation: "Choice D is the best answer. The convention being tested is the use of verbs to express tense. In this choice, the present tense verb “survives” correctly indicates that the wood frog regularly survives subfreezing temperatures by producing large amounts of glucose.\nChoice A is incorrect because the past perfect verb “had survived” doesn’t indicate that the wood frog regularly survives subfreezing temperatures by producing large amounts of glucose. \nChoice B is incorrect because the past tense verb “survived” doesn’t indicate that the wood frog regularly survives subfreezing temperatures by producing large amounts of glucose. Choice C is incorrect because the conditional verb “would survive” doesn’t indicate that the wood frog regularly survives subfreezing temperatures by producing large amounts of glucose.\n"
  }, {
    type: "multiple-choice",
    tags: ["Grammar and Conventions"],
    passage: " \nAfrican American Percy Julian was a scientist and entrepreneur whose work helped people around the world to see. Named in 1999 as one of the greatest achievements by a US chemist in the past hundred years, 	 led to the first mass-produced treatment for glaucoma.",
    question: "Which choice completes the text so that it conforms to the conventions of Standard English?",
    options: ["A)	Julian synthesized the alkaloid physostigmine in 1935; it\n", "B)	in 1935 Julian synthesized the alkaloid physostigmine, which\n", "C)	Julian’s 1935 synthesis of the alkaloid physostigmine\n", "D)	the alkaloid physostigmine was synthesized by Julian in 1935 and\n"],
    correctAnswer: "C",
    explanation: "Choice C is the best answer. The convention being tested is subject-modifier placement. This choice makes the noun phrase “Julian’s 1935 synthesis” the subject of the sentence and places it immediately after the modifying phrase “named…years.” In doing so, this choice clearly establishes that Julian’s 1935 synthesis of the alkaloid physostigmine—and not another noun in the sentence— was named in 1999 as one of the greatest achievements by a US chemist in the past hundred years.\nChoice A is incorrect because it results in a dangling modifier. The placement of the noun “Julian” immediately after the modifying phrase illogically suggests that Julian himself was named as one of the greatest achievements by a US chemist in the past hundred years. Choice B is incorrect because it results in a dangling modifier. The placement of the prepositional phrase “in 1935” immediately\nafter the modifying phrase illogically and confusingly suggests that “in 1935” was named as one of the greatest achievements by a US chemist in the past hundred years. Choice D is incorrect because it results in a dangling modifier. The placement of the noun phrase “the alkaloid physostigmine” immediately after the modifying phrase illogically and confusingly suggests that the alkaloid physostigmine itself (not the synthesis of it) was named as one of the greatest achievements by a US chemist in the past hundred years.\n"
  }, {
    type: "multiple-choice",
    tags: ["Character Analysis", "Theme"],
    passage: `King Lear is a circa 1606 play by William Shakespeare. In the play, the character of King Lear attempts to test his three daughters’ devotion to him. He later expresses regret for his actions, as is evident when he 	`,
    question: "Which choice most effectively uses a quotation from King Lear to illustrate the claim?\n",
    options: ["A)	says of himself, “I am a man / more sinned against than sinning.”\n", "B)	says during a growing storm, “This tempest will not give me leave to ponder / On things would hurt me more.”\n", "C)	says to himself while striking his head, “Beat at this gate that let thy folly in / And thy dear judgement out!”\n", "D)	says of himself, “I will do such things— / What they are yet, I know not; but they shall be / The terrors of the earth!”\n"],
    correctAnswer: "C",
    explanation: "Choice C is the best answer because it most effectively uses a quotation from King Lear to illustrate the claim that King Lear expresses regret for his actions. In the quotation, Lear describes striking himself on the head—the same act he’s engaged in as he speaks, and one that suggests he’s deeply upset with himself. Referring to himself in the second person (with “thy”), the character\nexclaims “Beat at this gate that let thy folly in / And thy dear judgement out!” Lear refers metaphorically to his own mind as a gate that has allowed folly, or poor judgement, to enter and good judgement to escape. This suggests that Lear regrets his attempts to test his three daughters’ devotion to him, regarding those attempts as examples of the folly that has entered the gate of his mind.\n"
  }, {
    type: "multiple-choice",
    tags: ["Grammar and Conventions", "Theme"],
    passage: "Whether the reign of a French monarch such as Hugh Capet or Henry I was historically\nconsequential or relatively uneventful, its trajectory was shaped by questions of legitimacy and therefore cannot be understood without a corollary understanding of the factors that allowed the monarch to 	 his right to hold the throne.\n",
    question: "Which choice completes the text with the most logical and precise word or phrase?",
    options: ["A)	reciprocate\n", "B)	annotate\n", "C)	buttress\n", "D)	disengage\n"],
    correctAnswer: "C",
    explanation: "Choice C is the best answer because it most logically completes the text’s discussion of the legitimacy of the reigns of French monarchs such as Hugh Capet and Henry I. As used in this context, “buttress” means to strengthen or defend. The text indicates that regardless of whether a French monarch’s reign was significant or uneventful, each monarch faced questions about his right to the throne. The text goes on to say that in order to understand the path of a French monarch’s reign, it’s important to understand what contributed to the monarch’s ability to “hold the throne.” This context suggests that French monarchs such as Hugh Capet and Henry I had to buttress, or defend, their right to be monarch.\nChoice A is incorrect. Saying that a monarch who is faced with questions about the legitimacy of his reign was able to “reciprocate” his right to the French throne would mean that he either returned his right to the throne or that he responded in kind to the challenge. Neither of these meanings would make sense in context because the text focuses on people who did reign as French monarchs and defended their right to do so. Choice B is incorrect because it wouldn’t make sense in context to discuss factors that enabled a monarch to “annotate,” or add notes to or explain, his right to the French throne. Nothing in the text suggests that the monarchs were writing notes about their right to the throne; instead, faced with questions about the legitimacy of their reign, the monarchs defended their right. Choice D is incorrect because it wouldn’t make sense in context to discuss factors that enabled a monarch to “disengage,” or withdraw his right to the French throne. The text focuses on an examination of people who reigned as French monarchs, not on people who didn’t choose to rule.\n"
  }, {
    type: "multiple-choice",
    tags: ["Linear Equations"],
    passage: `3 more than 8 times a number x is equal to 83. Which equation represents this situation?`,
    question: "Choose the best answer",
    options: ["A)	(3)(8) x = 83\n", "B)	8x = 83 + 3\n", "C)	3x + 8 = 83\n", "D)	8x + 3 = 83\n"],
    correctAnswer: "D",
    explanation: "Choice D is correct. The given phrase “8 times a number x ” can be represented by the expression 8x . The given phrase “3 more than” indicates an increase of 3 to a quantity. Therefore “3 more than 8 times a number x ” can be represented by the expression 8x + 3. Since it’s given that 3 more than 8 times a number x is equal to 83, it follows that 8x + 3 is equal to 83, or 8x + 3 = 83. Therefore, the equation that represents this situation is 8x + 3 = 83.\nChoice A is incorrect. This equation represents 3 times the quantity 8 times a number x is equal to 83. Choice B is incorrect. This equation represents 8 times a number x is equal to 3 more than 83. Choice C is incorrect. This equation represents 8 more than 3 times a number x is equal to 83.\n"
  }, {
    type: "multiple-choice",
    tags: ["Linear Equations", "Ratio and Proportions"],
    passage: "For a certain rectangular region, the ratio of its length to its width is 35 to 10. If the width of the rectangular region increases by 7 units, how must the length change to maintain this ratio?",
    question: "Choose the best answer",
    options: ["A)	It must decrease by 24.5 units.\n", "B)	It must increase by 24.5 units.\n", "C)	It must decrease by 7 units.\n", "D)	It must increase by 7 units.\n"],
    correctAnswer: "B",
    explanation: "Choice B is correct. It’s given that the ratio of the rectangular region’s length to its width is 35 to 10. This can be written as a proportion:  length / width =  35 / 10, or ℓ / w = 35 / 10 . This proportion can be rewritten as 10ℓ= 35w , or ℓ= 3.5w . If the width of the rectangular region increases by 7, then the length will increase by some number x in order to maintain this ratio. The value of x can be found by replacing ℓ with ℓ + x and w with w + 7 in the equation, which gives ℓ+ x = 3.5(w + 7). This equation can be rewritten using the distributive property as ℓ + x = 3.5w + 24.5.\n"
  }, {
    type: "multiple-choice",
    tags: ["Unit Conversion"],
    passage: "A fish swam a distance of 5,104 yards. How far did the fish swim, in miles? (1 mile = 1,760 yards)",
    question: "Choose the best answer",
    options: ["A)	0.3\n", "B)	2.9\n", "C)	3,344\n", "D)	6,864\n"],
    correctAnswer: "B",
    explanation: "Choice B is correct. It’s given that the fish swam 5,104 yards and that 1 mile is\nequal to 1,760 yards. Therefore, the fish swam 5,104 yards * 1 mile / 1,760 yards, which is\nequivalent to 5,104 / 1,760 miles, or 2.9 miles.\n"
  }, {
    type: "multiple-choice",
    tags: ["Coordinate Geometry"],
    passage: "The point (8, 2) in the xy-plane is a solution to which of the following systems of inequalities?",
    question: "Choose the best answer",
    options: ["A)	x > 0 \ny > 0 \n", "B)	x > 0 \ny < 0 \n", "C)	x < 0 \ny > 0 \n", "D)	x < 0 \ny < 0 \n"],
    correctAnswer: "A",
    explanation: "Choice A is correct. The given point, (8, 2), is located in the first quadrant in the xy-plane. The system of inequalities in choice A represents all the points in the first quadrant in the xy-plane. Therefore, (8, 2) is a solution to the system of inequalities in choice A.\nAlternate approach: Substituting 8 for x in the first inequality in choice A, x > 0, yields 8 > 0, which is true. Substituting 2 for y in the second inequality in choice A, y > 0, yields 2 > 0, which is true. Since the coordinates of the\npoint (8, 2) make the inequalities x > 0 and y > 0 true, the point (8, 2) is a\nsolution to the system of inequalities consisting of x > 0 and y > 0.\nChoice B is incorrect. This system of inequalities represents all the points in the fourth quadrant, not the first quadrant, in the xy-plane. Choice C is incorrect. This system of inequalities represents all the points in the second quadrant, not the first quadrant, in the xy-plane. Choice D is incorrect. This system of inequalities represents all the points in the third quadrant, not the first quadrant, in the\nxy-plane.\n"
  }, {
    type: "writing",
    passage: `Creative Writing Prompt:`,
    question: "Describe a day when everything went wrong but ended happily.",
    correctAnswer: "",
    explanation: "Because I said so."
  }, {
    type: "speaking",
    passage: `Speaking Practice:`,
    question: "Talk for 30 seconds about your favorite hobby.",
    correctAnswer: "",
    explanation: "Because I said so."
  }];
  const [answers, setAnswers] = useState(questions.map((q) => ({
    selectedOption: null,
    writingAnswer: "",
    audioBlob: null
  })));
  answers[currentQuestion];
  const [reviewMode, setReviewMode] = useState(false);
  const goNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => Math.min(prev + 1, questions.length - 1));
    } else {
      setSubmitted(true);
      setCurrentQuestion(0);
      const scores = {};
      questions.forEach((q, idx) => {
        var _a;
        if (q.tags && q.type === "multiple-choice") {
          const isCorrect = ((_a = answers[idx]) == null ? void 0 : _a.selectedOption) === q.correctAnswer;
          q.tags.forEach((tag) => {
            if (!scores[tag]) scores[tag] = {
              correct: 0,
              total: 0
            };
            scores[tag].total += 1;
            if (isCorrect) scores[tag].correct += 1;
          });
        }
      });
      setTagScores(scores);
      setReviewMode(true);
    }
  };
  const goBack = () => {
    setCurrentQuestion((prev) => Math.max(prev - 1, 0));
    resetState();
  };
  const resetState = () => {
    setSelectedOption(null);
    setWritingAnswer("");
    setAudioURL(null);
    setIsRecording(false);
    setAIFeedback(null);
  };
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    const recorder = new MediaRecorder(stream);
    const audioChunks = [];
    recorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks);
      const updated = [...answers];
      updated[currentQuestion].audioBlob = audioBlob;
      setAnswers(updated);
      setAudioURL(URL.createObjectURL(audioBlob));
    };
    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };
  const stopRecording = () => {
    mediaRecorder.stop();
    setIsRecording(false);
  };
  const current = questions[currentQuestion];
  const mcqQuestions = questions.filter((q) => q.type === "multiple-choice");
  const correctCount = mcqQuestions.filter((q, i) => {
    var _a;
    return q.correctAnswer === ((_a = answers[questions.indexOf(q)]) == null ? void 0 : _a.selectedOption);
  }).length;
  const handleAskAI = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:4000/api/ai-explanation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        passage: current.passage,
        question: current.question,
        options: current.options,
        highlight
      })
    });
    const data = await res.json();
    setAIExplanation(data.mainResponse);
    setSubpoints(data.subpoints || []);
    setSubExplanation("");
    animateMarkdown(data.mainResponse);
    setLoading(false);
  };
  const animateMarkdown = (fullText) => {
    let i = 0;
    const step = () => {
      setDisplayedMarkdown(fullText.slice(0, i));
      if (i < fullText.length) {
        i++;
        setTimeout(step, 10);
      }
    };
    step();
  };
  const fetchSubpoint = async (index) => {
    const res = await fetch("http://localhost:4000/api/ai-explanation-subpoint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        highlight,
        subpoint: subpoints[index],
        pointIndex: index
      })
    });
    const data = await res.json();
    setSubExplanation(data.subExplanation);
  };
  const handleHighlight = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setHighlight(selection.toString().trim());
    }
  };
  const ExplanationBox = () => /* @__PURE__ */ jsxs("div", {
    className: "mt-4 text-gray-700 pl-4 border-l-4 border-blue-400 relative",
    onMouseUp: handleHighlight,
    children: [/* @__PURE__ */ jsx("strong", {
      children: "Explanation:"
    }), " ", current.explanation, highlight && /* @__PURE__ */ jsx("button", {
      onClick: handleAskAI,
      className: "absolute top-0 right-0 mt-1 mr-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600",
      children: "🔍 Ask AI"
    }), loading && /* @__PURE__ */ jsx("p", {
      className: "mt-4 text-blue-600",
      children: "Thinking..."
    }), displayedMarkdown && /* @__PURE__ */ jsxs("div", {
      className: "mt-6 border-l-4 border-green-400 pl-4 space-y-2",
      children: [/* @__PURE__ */ jsx("strong", {
        className: "text-green-700",
        children: "AI Explanation:"
      }), /* @__PURE__ */ jsx("div", {
        className: "prose prose-sm text-gray-800",
        children: /* @__PURE__ */ jsx(ReactMarkdown, {
          children: displayedMarkdown
        })
      }), /* @__PURE__ */ jsx("div", {
        className: "mt-2 space-y-2",
        children: subpoints.map((point, idx) => /* @__PURE__ */ jsxs("button", {
          className: "block text-left text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded w-full",
          onClick: () => fetchSubpoint(idx),
          children: ["🔎 Explain point ", idx + 1, " deeper"]
        }, idx))
      }), subExplanation && /* @__PURE__ */ jsxs("div", {
        className: "mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded",
        children: [/* @__PURE__ */ jsx("h4", {
          className: "font-semibold mb-1",
          children: "Further Explanation:"
        }), /* @__PURE__ */ jsx("div", {
          className: "prose prose-sm text-gray-800",
          children: /* @__PURE__ */ jsx(ReactMarkdown, {
            children: subExplanation
          })
        })]
      })]
    })]
  });
  const radarFormat = (tags) => tags.map((tag) => {
    var _a, _b;
    const correct = ((_a = tagScores[tag]) == null ? void 0 : _a.correct) || 0;
    const total = ((_b = tagScores[tag]) == null ? void 0 : _b.total) || 0;
    const percentage = total > 0 ? Math.round(correct / total * 100) : 0;
    return {
      subject: tag,
      score: percentage,
      // 0–100%
      fullMark: 100
      // normalize chart
    };
  });
  const englishRadarData = radarFormat(englishTags);
  const mathRadarData = radarFormat(mathTags);
  useEffect(() => {
    const tagPerformance = Object.entries(tagScores).map(([tag, {
      correct,
      total
    }]) => ({
      tag,
      percent: total > 0 ? Math.round(correct / total * 100) : 0
    }));
    const fetchDebrief = async () => {
      const res = await fetch("http://localhost:4000/api/debrief-audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tagPerformance
        })
      });
      const data = await res.json();
      setDebriefAudio(data.audio);
    };
    fetchDebrief();
  }, [tagScores]);
  useEffect(() => {
    if (debriefAudio) {
      requestAnimationFrame(() => {
        if (audioRef.current) {
          const attempt = audioRef.current.play();
          if (attempt !== void 0) {
            attempt.catch((err) => console.warn("Autoplay blocked by browser:", err));
          }
        }
      });
    }
  }, [debriefAudio]);
  return /* @__PURE__ */ jsx("div", {
    className: "flex flex-col h-screen",
    children: reviewMode ? showReviewIntro ? /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col items-center justify-center flex-1 p-10 text-center",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-2xl font-bold mb-4",
        children: "Review Summary"
      }), /* @__PURE__ */ jsxs("p", {
        className: "mb-2",
        children: ["You answered ", questions.length, " questions."]
      }), /* @__PURE__ */ jsxs("div", {
        className: "mb-6",
        children: [/* @__PURE__ */ jsxs("h2", {
          className: "text-lg font-semibold",
          children: ["Your Score (MCQ Only): ", Math.round(correctCount / mcqQuestions.length * 100), "%"]
        }), /* @__PURE__ */ jsxs("div", {
          className: "w-175",
          children: [/* @__PURE__ */ jsxs(RadarChart, {
            outerRadius: 90,
            width: 700,
            height: 300,
            data: englishRadarData,
            children: [/* @__PURE__ */ jsx(PolarGrid, {}), /* @__PURE__ */ jsx(PolarAngleAxis, {
              dataKey: "subject"
            }), /* @__PURE__ */ jsx(PolarRadiusAxis, {
              angle: 30,
              domain: [0, 100]
            }), /* @__PURE__ */ jsx(Radar, {
              name: "English",
              dataKey: "score",
              stroke: "#1d4ed8",
              fill: "#60a5fa",
              fillOpacity: 0.6
            }), /* @__PURE__ */ jsx(Tooltip, {
              formatter: (value) => `${value}%`
            })]
          }), /* @__PURE__ */ jsxs(RadarChart, {
            outerRadius: 90,
            width: 700,
            height: 300,
            data: mathRadarData,
            children: [/* @__PURE__ */ jsx(PolarGrid, {}), /* @__PURE__ */ jsx(PolarAngleAxis, {
              dataKey: "subject"
            }), /* @__PURE__ */ jsx(PolarRadiusAxis, {
              angle: 30,
              domain: [0, 100]
            }), /* @__PURE__ */ jsx(Radar, {
              name: "Math",
              dataKey: "score",
              stroke: "#1d4ed8",
              fill: "#60a5fa",
              fillOpacity: 0.6
            }), /* @__PURE__ */ jsx(Tooltip, {
              formatter: (value) => `${value}%`
            })]
          })]
        })]
      }), debriefAudio && /* @__PURE__ */ jsxs("div", {
        className: "mt-6",
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-sm italic text-gray-600",
          children: "AI Audio Summary:"
        }), /* @__PURE__ */ jsx("audio", {
          ref: audioRef,
          controls: true,
          src: debriefAudio,
          className: "mt-2"
        })]
      }), /* @__PURE__ */ jsx("button", {
        className: "bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700",
        onClick: () => setShowReviewIntro(false),
        children: "Start Reviewing Questions"
      })]
    }) : /* @__PURE__ */ jsxs("div", {
      className: "p-6 space-y-6",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-xl font-bold",
        children: "Review Your Answers"
      }), /* @__PURE__ */ jsx("div", {
        className: "flex space-x-2",
        children: questions.map((q, idx) => {
          var _a;
          const isMCQ = q.type === "multiple-choice";
          const userAnswer = (_a = answers[idx]) == null ? void 0 : _a.selectedOption;
          const isCorrect = isMCQ && userAnswer === q.correctAnswer;
          return /* @__PURE__ */ jsxs("button", {
            className: `border px-3 py-1 rounded hover:bg-gray-200 ${isMCQ ? isCorrect ? "text-green-600" : "text-red-600" : ""}`,
            onClick: () => setCurrentQuestion(idx),
            children: ["Q", idx + 1]
          }, idx);
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex flex-1 overflow-auto",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "w-2/5 border-r p-6 overflow-y-auto",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-lg font-bold mb-4",
            children: "Passage"
          }), /* @__PURE__ */ jsx("div", {
            className: "prose prose-sm text-gray-800",
            children: /* @__PURE__ */ jsx(ReactMarkdown, {
              children: current.passage
            })
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "w-3/5 p-6 overflow-y-auto",
          children: [/* @__PURE__ */ jsxs("h2", {
            className: "text-lg font-bold mb-4",
            children: ["Question ", currentQuestion + 1]
          }), /* @__PURE__ */ jsx("p", {
            className: "mb-4",
            children: questions[currentQuestion].question
          }), questions[currentQuestion].type === "multiple-choice" && /* @__PURE__ */ jsx("ul", {
            className: "space-y-1",
            children: questions[currentQuestion].options.map((opt, i) => {
              const label = String.fromCharCode(65 + i);
              const isUserAnswer = label === answers[currentQuestion].selectedOption;
              const isCorrectAnswer = label === questions[currentQuestion].correctAnswer;
              return /* @__PURE__ */ jsxs("li", {
                className: `px-3 py-2 rounded border ${isUserAnswer && isCorrectAnswer ? "bg-green-300 border-green-950" : isUserAnswer ? "bg-red-100 border-red-500" : isCorrectAnswer ? "bg-green-200 border-green-950" : ""}`,
                children: [/* @__PURE__ */ jsxs("strong", {
                  children: [label, "."]
                }), " ", opt]
              }, label);
            })
          }), questions[currentQuestion].type === "writing" && /* @__PURE__ */ jsxs("div", {
            className: "p-2 bg-gray-50 rounded border",
            children: [/* @__PURE__ */ jsx("p", {
              children: /* @__PURE__ */ jsx("strong", {
                children: "Your Response:"
              })
            }), /* @__PURE__ */ jsx("p", {
              children: answers[currentQuestion].writingAnswer || "(No response given)"
            })]
          }), questions[currentQuestion].type === "speaking" && /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("strong", {
              children: "Your Recording:"
            }), answers[currentQuestion].audioBlob ? /* @__PURE__ */ jsx("audio", {
              controls: true,
              src: URL.createObjectURL(answers[currentQuestion].audioBlob)
            }) : /* @__PURE__ */ jsx("p", {
              children: "(No recording provided)"
            })]
          })]
        })]
      }), /* @__PURE__ */ jsx(ExplanationBox, {})]
    }) : /* @__PURE__ */ jsxs(Fragment, {
      children: [/* @__PURE__ */ jsx("div", {
        className: "bg-gray-800 text-white flex justify-between items-center p-4",
        children: /* @__PURE__ */ jsxs("div", {
          className: "space-x-2",
          children: [/* @__PURE__ */ jsx("button", {
            onClick: goBack,
            className: "bg-gray-600 px-4 py-2 rounded hover:bg-gray-500",
            children: "Back"
          }), /* @__PURE__ */ jsx("button", {
            onClick: goNext,
            className: "bg-gray-600 px-4 py-2 rounded hover:bg-gray-500",
            children: "Next"
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        className: "flex flex-1 overflow-auto",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "w-1/2 border-r p-6 overflow-y-auto",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-lg font-bold mb-4",
            children: "Passage"
          }), /* @__PURE__ */ jsx("div", {
            className: "pl-6 border-l-4 border-gray-300 bg-gray-50 rounded-md",
            children: /* @__PURE__ */ jsx(ReactMarkdown, {
              children: current.passage
            })
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "w-1/2 p-6 overflow-y-auto",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-lg font-bold mb-4",
            children: "Question"
          }), current.type === "math" ? /* @__PURE__ */ jsx("p", {
            className: "mb-4",
            children: current.question
          }) : /* @__PURE__ */ jsx("p", {
            className: "mb-4",
            children: current.question
          }), current.type === "multiple-choice" && /* @__PURE__ */ jsx("ul", {
            className: "space-y-2",
            children: current.options.map((option, index) => /* @__PURE__ */ jsx("li", {
              children: /* @__PURE__ */ jsxs("label", {
                className: "flex items-center space-x-2",
                children: [/* @__PURE__ */ jsx("input", {
                  type: "radio",
                  name: "option",
                  value: String.fromCharCode(65 + index),
                  disabled: submitted,
                  checked: answers[currentQuestion].selectedOption === String.fromCharCode(65 + index),
                  onChange: () => {
                    const updated = [...answers];
                    updated[currentQuestion].selectedOption = String.fromCharCode(65 + index);
                    setAnswers(updated);
                  }
                }), /* @__PURE__ */ jsx("span", {
                  children: option
                })]
              })
            }, index))
          }), current.type === "writing" && /* @__PURE__ */ jsx("textarea", {
            className: "w-full p-2 border rounded",
            rows: 6,
            placeholder: "Write your response here...",
            value: answers[currentQuestion].writingAnswer,
            onChange: (e) => {
              const updated = [...answers];
              updated[currentQuestion].writingAnswer = e.target.value;
              setAnswers(updated);
            },
            disabled: submitted
          }), current.type === "speaking" && /* @__PURE__ */ jsxs("div", {
            className: "flex items-center space-x-4",
            children: [!isRecording ? /* @__PURE__ */ jsx("button", {
              onClick: startRecording,
              className: "p-2 bg-green-600 rounded-full text-white hover:bg-green-700",
              children: /* @__PURE__ */ jsx(Mic, {
                size: 32
              })
            }) : /* @__PURE__ */ jsx("button", {
              onClick: stopRecording,
              className: "p-2 bg-red-600 rounded-full text-white hover:bg-red-700",
              children: /* @__PURE__ */ jsx(StopCircle, {
                size: 32
              })
            }), audioURL && /* @__PURE__ */ jsx("audio", {
              controls: true,
              src: audioURL
            })]
          }), aiFeedback && /* @__PURE__ */ jsxs("div", {
            className: "mt-6 p-4 bg-gray-100 rounded",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "font-semibold mb-2",
              children: "AI Feedback:"
            }), /* @__PURE__ */ jsx("p", {
              children: aiFeedback
            })]
          })]
        })]
      })]
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BBB0IlxD.js", "imports": ["/assets/chunk-LSOULM7L-DOVEwRHk.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-CpcbURJr.js", "imports": ["/assets/chunk-LSOULM7L-DOVEwRHk.js", "/assets/with-props-DxkgRFrl.js"], "css": ["/assets/root-DPxWn_-P.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-BrOTPRW3.js", "imports": ["/assets/with-props-DxkgRFrl.js", "/assets/chunk-LSOULM7L-DOVEwRHk.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-39c6e438.js", "version": "39c6e438", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routes,
  ssr
};
