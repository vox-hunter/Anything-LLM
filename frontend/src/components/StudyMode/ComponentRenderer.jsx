import MultipleChoice from "./components/MultipleChoice";
import Flashcard from "./components/Flashcard";
import ConceptExplainer from "./components/ConceptExplainer";
import ShortAnswer from "./components/ShortAnswer";
import Hint from "./components/Hint";
import Diagram from "./components/Diagram";
import FillInBlank from "./components/FillInBlank";
import CustomComponentRenderer from "./components/CustomComponentRenderer";

const BUILT_IN_COMPONENTS = {
  multiple_choice: MultipleChoice,
  flashcard: Flashcard,
  concept_explainer: ConceptExplainer,
  short_answer: ShortAnswer,
  hint: Hint,
  diagram: Diagram,
  fill_in_blank: FillInBlank,
};

/**
 * Renders AG-UI / A2UI components or custom AI-generated components.
 * @param {Object} props
 * @param {Object} props.data - The AG-UI response JSON object
 * @param {Function} props.onSubmit - Callback when student submits input
 */
export default function ComponentRenderer({ data, onSubmit }) {
  if (!data || typeof data !== "object") return null;

  // Handle built-in A2UI components
  if (data.type === "a2ui_component") {
    const Component = BUILT_IN_COMPONENTS[data.component];
    if (!Component) {
      return (
        <div className="bg-theme-bg-secondary rounded-lg p-4 my-2 border border-white/10">
          <p className="text-white/60 text-sm">
            Unknown component: {data.component}
          </p>
        </div>
      );
    }
    return (
      <Component
        content={data.content || data}
        onSubmit={onSubmit}
        componentId={data.component_id}
      />
    );
  }

  // Handle custom AI-generated components
  if (data.type === "custom_component") {
    return (
      <CustomComponentRenderer
        name={data.name}
        description={data.description}
        props={data.props || {}}
        inputs={data.inputs || []}
        onSubmit={onSubmit}
        componentId={data.component_id}
      />
    );
  }

  // Fallback for unrecognized response types
  return (
    <div className="bg-theme-bg-secondary rounded-lg p-4 my-2 border border-white/10">
      <p className="text-white/80 text-sm">
        {data.text || data.content || JSON.stringify(data)}
      </p>
    </div>
  );
}
