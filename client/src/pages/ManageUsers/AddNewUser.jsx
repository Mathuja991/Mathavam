import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddNewUser() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    userType: '',
    username: '',
    password: '',
    confirmPassword: '',
    childRegNo: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [availablePatients, setAvailablePatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // State for username availability check
  const [allUsers, setAllUsers] = useState([]);
  const [usernameStatus, setUsernameStatus] = useState('idle'); // idle, checking, available, taken

  const userTypes = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person', 'Parent'];

  useEffect(() => {
    const fetchAndFilterData = async () => {
      setIsLoadingPatients(true);
      setFetchError('');
      try {
        const [usersResponse, patientsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/users'),
          axios.get('http://localhost:5000/api/patientRecords')
        ]);

        const allUsersData = usersResponse.data;
        const allPatients = patientsResponse.data;

        setAllUsers(allUsersData); // Store all users for username check

        const assignedChildNos = new Set(
          allUsersData
            .filter(user => user.userType === 'Parent' && user.childRegNo)
            .map(user => user.childRegNo)
        );

        const filteredPatients = allPatients.filter(patient => !assignedChildNos.has(patient.childNo));

        setAvailablePatients(filteredPatients);
      } catch (err) {
        setFetchError('Failed to load patient list. Please check the connection.');
      } finally {
        setIsLoadingPatients(false);
      }
    };

    fetchAndFilterData();
  }, []);

  // useEffect for debounced username check
  useEffect(() => {
    if (!formData.username) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(() => {
      const isTaken = allUsers.some(
        (user) => user.username.toLowerCase() === formData.username.toLowerCase()
      );
      setUsernameStatus(isTaken ? 'taken' : 'available');
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer); // Cleanup timer on re-render
  }, [formData.username, allUsers]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'userType' && value !== 'Parent') {
      setFormData(prev => ({ ...prev, childRegNo: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // New check for username availability before submitting
    if (usernameStatus === 'taken') {
        setError('This username is already taken. Please choose another.');
        return;
    }

    if (!formData.firstName || !formData.lastName || !formData.idNumber || !formData.userType || !formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.userType === 'Parent' && !formData.childRegNo) {
      setError('Please select a Patient for the Parent user type.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/add', formData);
      setMessage(response.data.message);
      setFormData({
        firstName: '',
        lastName: '',
        idNumber: '',
        userType: '',
        username: '',
        password: '',
        confirmPassword: '',
        childRegNo: ''
      });
      setUsernameStatus('idle'); // Reset username status on success
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const renderUsernameStatus = () => {
    switch (usernameStatus) {
      case 'checking':
        return <p style={{...styles.statusText, ...styles.statusChecking}}>Checking...</p>;
      case 'available':
        return <p style={{...styles.statusText, ...styles.statusAvailable}}>✔️ Good to use </p>;
      case 'taken':
        return <p style={{...styles.statusText, ...styles.statusTaken}}>❌ Already taken</p>;
      default:
        return null; // 'idle' state
    }
  };

  return (
    <div style={styles.pageContainer}>
        <div style={styles.container}>
            <h1 style={styles.heading}>Create a New User Account</h1>
            
            {message && <p style={styles.successMessage}>{message}</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.gridContainer}>
                    <div style={styles.formGroup}>
                        <label htmlFor="firstName" style={styles.label}>First Name</label>
                        <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required style={styles.input}/>
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="lastName" style={styles.label}>Last Name</label>
                        <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required style={styles.input}/>
                    </div>
                </div>

                <div style={styles.gridContainer}>
                    <div style={styles.formGroup}>
                        <label htmlFor="idNumber" style={styles.label}>ID Number</label>
                        <input type="text" id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleChange} required style={styles.input}/>
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="userType" style={styles.label}>User Type</label>
                        <select id="userType" name="userType" value={formData.userType} onChange={handleChange} required style={styles.select}>
                            <option value="">Select User Type...</option>
                            {userTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {formData.userType === 'Parent' && (
                    <div style={styles.formGroup}>
                        <label htmlFor="childRegNo" style={styles.label}>Patient Name (Child No)</label>
                        {isLoadingPatients ? (
                            <p style={styles.loadingText}>Loading available patients...</p>
                        ) : fetchError ? (
                            <p style={styles.errorMessage}>{fetchError}</p>
                        ) : (
                            <select id="childRegNo" name="childRegNo" value={formData.childRegNo} onChange={handleChange} required={formData.userType === 'Parent'} style={styles.select}>
                                <option value="">Select a Patient...</option>
                                {availablePatients.length > 0 ? (
                                    availablePatients.map((patient) => (
                                        <option key={patient.childNo} value={patient.childNo}>
                                            {patient.name} ({patient.childNo})
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No unassigned patients found</option>
                                )}
                            </select>
                        )}
                    </div>
                )}

                {/* Username with real-time availability check */}
                <div style={styles.usernameCheckContainer}>
                    <div style={styles.formGroup}>
                        <label htmlFor="username" style={styles.label}>Username</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required style={styles.input}/>
                    </div>
                    <div style={styles.statusMessageContainer}>
                        {renderUsernameStatus()}
                    </div>
                </div>

                <div style={styles.gridContainer}>
                    <div style={styles.formGroup}>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required style={styles.input}/>
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={styles.input}/>
                    </div>
                </div>

                <button type="submit" style={styles.button}>Add New User</button>
            </form>
        </div>
    </div>
  );
}

// Modern Styling Object
const styles = {
  pageContainer: {
    background: 'linear-gradient(135deg, #2a88e6 0%, #17a2b8 100%)',
    minHeight: '100vh',
    padding: '40px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    maxWidth: '700px',
    width: '100%',
    margin: '0 auto',
    padding: '30px 40px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '25px',
    color: '#343a40',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '20px',
    // Remove bottom margin when inside a grid for alignment
    gridColumn: 'span 1',
  },
  label: {
    display: 'block',
    fontWeight: '600',
    color: '#495057',
    marginBottom: '8px',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #ced4da',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: '#f8f9fa',
  },
  select: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #ced4da',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
  },
  button: {
    padding: '15px 20px',
    background: 'linear-gradient(to right, #0ba360, #3cba92)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    width: '100%',
  },
  successMessage: {
    color: '#155724',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#721c24',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  usernameCheckContainer: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr', // Give more space to input
    gap: '20px',
    alignItems: 'flex-end', // Align items to the bottom
  },
  statusMessageContainer: {
    paddingBottom: '20px', // Match the margin of formGroup
    textAlign: 'left',
  },
  statusText: {
    margin: '0',
    fontSize: '14px',
    fontWeight: '600',
  },
  statusAvailable: {
    color: '#28a745', // Green
  },
  statusTaken: {
    color: '#dc3545', // Red
  },
  statusChecking: {
    color: '#6c757d', // Grey
  },
  loadingText: {
      color: '#495057',
      fontStyle: 'italic',
  }
};

