import React from 'react'

const Apart = ({ answers, handleAnswerChange, severityRating, setSeverityRating, isEditing }) => { 
  return (
    <>
      <tr className="bg-blue-300 border-blue-300 text-white">
        <th className="p-2">
          A. Persistent deficits in social communication and social interaction across multiple contexts, as manifested by the following, currently or by history <strong>(All 3 must be met)</strong>
        </th>
        <th className="border border-blue-200 p-2">Present</th>
        <th className="border border-blue-3300 p-2">Not present</th>
      </tr>
      {[
        "1. Deficits in social-emotional reciprocity, ranging, for example, from abnormal social approach and failure of normal back-and-forth conversation; to reduced sharing of interests, emotions, or affect; to failure to initiate or respond to social interactions.",
        "2. Deficits in nonverbal communicative behaviors used for social interaction, ranging, for example, from poorly integrated verbal and nonverbal communication; to abnormalities in eye contact and body language or deficits in understanding and use of gestures; to a total lack of facial expressions and nonverbal communication.",
        "3. Deficits in developing, maintaining, and understanding relationships, ranging, for example, from difficulties adjusting behavior to suit various social contexts; to difficulties in sharing imaginative play or in making friends; to absence of interest in peers.",

      ].map((item, index) => (
        <tr key={index} className="hover:bg-blue-50 transition-colors">
          <td className="border border-blue-300 p-2 text-gray-700 text-left">{item}</td>
          <td className="border border-blue-300 p-2 text-center">
            <input
              type="radio"
              name={`socialCommunication${index}`}
              value="Present"
              checked={answers.socialCommunication[index] === "Present"}
              onChange={() => handleAnswerChange("socialCommunication", index, "Present")}
              className="transform scale-150 cursor-pointer"
              disabled={!isEditing} 
            />
          </td>
          <td className="border border-blue-300 text-center">
            <input
              type="radio"
              name={`socialCommunication${index}`}
              value="Not present"
              checked={answers.socialCommunication[index] === "Not present"}
              onChange={() => handleAnswerChange("socialCommunication", index, "Not present")}
              className="transform scale-150 cursor-pointer"
              disabled={!isEditing} 
            />
          </td>
        </tr>
      ))}
      <tr className="">
        <td className="border border-blue-300 p-4 text-gray-700" colSpan="3">
          <p className="text-center text-lg font-semibold">
            Social communication domain severity rating
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
                onClick={isEditing ? () => setSeverityRating(option) : undefined} 
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

export default Apart