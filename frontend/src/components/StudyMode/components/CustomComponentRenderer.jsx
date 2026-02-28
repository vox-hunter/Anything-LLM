import { useState } from "react";

/**
 * Renders custom AI-generated components safely.
 * Handles dynamic props and input collection.
 */
export default function CustomComponentRenderer({
  name,
  description,
  props = {},
  inputs = [],
  onSubmit,
  componentId,
}) {
  const [inputValues, setInputValues] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (inputId, value) => {
    setInputValues((prev) => ({ ...prev, [inputId]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit?.({
      component_id: componentId,
      student_input: inputValues,
    });
  };

  return (
    <div className="bg-theme-bg-secondary rounded-lg p-4 my-2 border border-purple-500/30">
      <p className="text-purple-300 text-xs font-semibold mb-1">
        ✨ Interactive Component
      </p>
      {name && <h3 className="text-white font-bold mb-1">{name}</h3>}
      {description && (
        <p className="text-white/70 text-sm mb-3">{description}</p>
      )}

      {/* Render props as display content */}
      {Object.entries(props).map(([key, value]) => (
        <div key={key} className="mb-2">
          <p className="text-white/50 text-xs capitalize">{key}:</p>
          {Array.isArray(value) ? (
            <ul className="list-disc list-inside text-white/80 text-sm">
              {value.map((item, idx) => (
                <li key={idx}>{String(item)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-white/80 text-sm">{String(value)}</p>
          )}
        </div>
      ))}

      {/* Render input fields */}
      {inputs.length > 0 && !submitted && (
        <div className="mt-3 space-y-2">
          {inputs.map((input) => (
            <div key={input.id}>
              <label className="text-white/60 text-xs block mb-1">
                {input.description || input.id}
              </label>
              {input.type === "array" ? (
                <textarea
                  className="w-full p-2 rounded-md bg-theme-settings-input-bg text-white text-sm border border-white/10 focus:border-purple-500 focus:outline-none resize-none"
                  rows={2}
                  placeholder="Enter items separated by commas..."
                  onChange={(e) =>
                    handleInputChange(
                      input.id,
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                />
              ) : (
                <input
                  type="text"
                  className="w-full p-2 rounded-md bg-theme-settings-input-bg text-white text-sm border border-white/10 focus:border-purple-500 focus:outline-none"
                  placeholder={`Enter ${input.description || input.id}...`}
                  onChange={(e) =>
                    handleInputChange(input.id, e.target.value)
                  }
                />
              )}
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-all"
          >
            Submit
          </button>
        </div>
      )}
      {submitted && (
        <p className="mt-2 text-sm text-purple-400">Response submitted ✓</p>
      )}
    </div>
  );
}
