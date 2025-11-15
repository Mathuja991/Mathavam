import React from 'react'

const Bpart = ({ answers, handleAnswerChange, severityRating, setSeverityRating, isEditing }) => { // Add isEditing prop
  return (
    <>
      <tr className="bg-blue-300 text-white">
        <th className="border border-blue-300 p-2">
          B. Restricted, repetitive patterns of behavior, interests, or activities as manifested by at least two of the following, currently or by history:
        </th>
        <th className="border border-blue-300 p-2">Present</th>
        <th className="border border-blue-300 p-2">Not present</th>
      </tr>
      {[
        "1. Stereotyped or repetitive motor movements, use of objects, or speech (e.g., simple motor stereotypies, lining up toys or flipping objects, echolalia, idiosyncratic phrases).",
        "2. Insistence on sameness, inflexible adherence to routines, or ritualized patterns of verbal or nonverbal behavior (e.g., extreme distress at small changes, difficulties with transitions, rigid thinking patterns, greeting rituals, need to take same route or eat same food every day).",
        "3. Highly restricted, fixated interests that are abnormal in intensity or focus (e.g., strong attachment to or preoccupation with unusual objects, excessively circumscribed or perseverative interests).",
        "4. Hyper-or hyporeactivity to sensory input or unusual interest in sensory aspects of the environment (e.g., apparent indifference to pain/temperature, adverse response to specific sounds or textures, excessive smelling or touching of objects, visual fascination with lights or movement)."
      ].map((item, index) => (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="border border-blue-300 p-2 text-gray-700 text-left">{item}</td>
          <td className="border border-blue-300 p-2 text-center">
            <input
              type="radio"
              name={`repetitiveBehaviors${index}`}
              value="Present"
              checked={answers.repetitiveBehaviors[index] === "Present"}
              onChange={() => handleAnswerChange("repetitiveBehaviors", index, "Present")}
              className="transform scale-150 cursor-pointer"
              disabled={!isEditing} 
            />
          </td>
          <td className="border border-blue-300 p-2 text-center">
            <input
              type="radio"
              name={`repetitiveBehaviors${index}`}
              value="Not present"
              checked={answers.repetitiveBehaviors[index] === "Not present"}
              onChange={() => handleAnswerChange("repetitiveBehaviors", index, "Not present")}
              className="transform scale-150 cursor-pointer"
              disabled={!isEditing} 
            />
          </td>
        </tr>
      ))}
      <tr className="">
        <td className="border border-blue-300 p-4 text-gray-700" colSpan="3">
          <p className="text-center text-lg font-semibold">
            Restricted,repetitive behaviours domain severity rating
            <span className="text-sm text-gray-600">(See DSM-5 page 52 for severity description)</span>
          </p>

          <div className="flex justify-center gap-4 mt-4">
            {["Requires Support", "Substantial Support", "Very Substantial Support"].map((option, index) => (
              <div
                key={index}
                className={`w-1/3 text-center p-2 border-2 rounded-lg cursor-pointer font-medium
                  ${severityRating === option
                    ? "bg-blue-500 text-white border-blue-700 shadow-lg"
                    : "bg-white text-gray-700 border-gray-400 hover:bg-gray-100"
                  }
                  ${!isEditing ? "opacity-60 cursor-not-allowed" : "" }`} 
                onClick={isEditing ? () => setSeverityRating(option) : undefined} // Only allow click if editing
              >
                {option}
              </div>
            ))}
          </div>
        </td>
      </tr>
    </>
  )
}

export default Bpart