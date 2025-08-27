import { useState, useEffect } from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';

function SensoryProfileReadPage() { // <--- This opens a function block
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterPatientId, setFilterPatientId] = useState('');

  const handleSearch = async () => { // <--- This opens a function block
    setIsLoading(true);
    setError(null);
      try { // <--- This opens a try block
        const response = await axios.get('/api/assessments/sensory-profile', {
            params: { patientId: filterPatientId? filterPatientId.trim(): undefined}
        });
        if (Array.isArray(response.data)) { // <--- This opens an if block
          setAssessments(response.data);
        } else { // <--- This opens an else block
          setAssessments(response.data ? [response.data] : []);
          console.warn("API response for sensory profiles was not an array:", response.data);
        }
      } catch (err) { // <--- This opens a catch block
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch assessment results.';
        setError(errorMessage);
        console.error('Error fetching sensory profiles:', err);
        setAssessments([]); // Crucial: On error, ensure `assessments` is an empty array
      } finally { // <--- This opens a finally block
        setIsLoading(false);
      } // <--- This closes the finally block
    }; // <--- This closes the handleSearch function block (MATCHED)

    const handleDelete = async (assessmentId) => { // <--- This opens a function block
      const isConfirmed = window.confirm ("Are you sure you want to delete this assessmet? This action cannot be undone.");
      if(!isConfirmed){ // <--- This opens an if block
        return;
      }

      try{ // <--- This opens a try block
        await axios.delete(`/api/assessments/sensory-profile/${assessmentId}`);

         setAssessments((currentAssessments) => // <--- This opens an arrow function body
           currentAssessments.filter(
             (assessment) => assessment._id !== assessmentId)
         ); // <--- Missing closing parenthesis for setAssessments call? No, it looks like it's part of the filter call
         alert("Assessment deleted successfully.");
      }catch(err){ // <--- This opens a catch block
        const errorMessage = err.response?.data?.message || "Failed to delete assessment.";
          setError(errorMessage);
          console.error("Delete error:", err);
      } // <--- This closes the catch block
    }; // <--- This closes the handleDelete function block (MATCHED)

    useEffect(() => { // <--- This opens the useEffect callback function
      handleSearch();
    }, []); // <--- This closes the useEffect callback function and array (MATCHED)

  if (isLoading) { // <--- This opens an if block
    return <div className="text-center p-10 text-lg font-medium">Loading Sensory Profiles...</div>;
  } // <--- This closes the if block (MATCHED)

 
  if (error) { // <--- This opens an if block
    return <div className="text-center p-10 text-red-600 font-bold">Error: {error}</div>;
  } // <--- This closes the if block (MATCHED)

  // This is the main JSX return block
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* ... rest of your JSX ... */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assessments.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  No sensory profiles have been saved yet.
                </td>
              </tr>
            ) : (
              assessments.map((assessment) => (
                <tr key={assessment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {assessment.patientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {assessment.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {" "}
                    {new Date(assessment.testDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to = {`../sensory-profile/edit/${assessment._id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={()=>handleDelete(assessment._id)}
                      className="text-red-600 hover:text-red-900"
                      >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  ); // <--- This closes the return statement for JSX (MATCHED)
} // <--- This closes the SensoryProfileReadPage function block (MATCHED)

export default SensoryProfileReadPage; // Line 176