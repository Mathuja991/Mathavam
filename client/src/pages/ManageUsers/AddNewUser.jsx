import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
  const [allUsers, setAllUsers] = useState([]);
  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const userTypes = ['Super Admin', 'Admin', 'Doctor', 'Therapist', 'Resource Person', 'Parent'];

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("AddNewUser: Auth token not found. Redirecting to login.");
      navigate('/?message=no_token');
      return null;
    }
    return {
      headers: {
        'x-auth-token': token,
      },
    };
  }, [navigate]);

  const fetchAndFilterData = useCallback(async () => {
    const config = getAuthConfig();
    if (!config) {
        return;
    }

    setIsLoadingPatients(true);
    setFetchError('');
    try {
      const [usersResponse, patientsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/users`, config),
        axios.get(`${import.meta.env.VITE_API_URL}/patientRecords`, config)
      ]);

      const allUsersData = usersResponse.data;
      const allPatients = patientsResponse.data.data || patientsResponse.data;

      setAllUsers(allUsersData);

      const assignedChildNos = new Set(
        allUsersData
          .filter(user => user.userType === 'Parent' && user.childRegNo)
          .map(user => user.childRegNo)
      );

      const filteredPatients = allPatients.filter(patient => {
         const regNo = patient.childNo || patient.childRegNo;
         return regNo && !assignedChildNos.has(regNo);
      });

      setAvailablePatients(filteredPatients);
    } catch (err) {
      if (err.response && err.response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/?message=session_expired');
      } else {
        console.error("Error fetching initial data:", err.response ? err.response.data : err.message);
        setFetchError('Failed to load user or patient list. Please check connection or log in again.');
      }
      setError(fetchError || 'Failed to load initial data.');
    } finally {
      setIsLoadingPatients(false);
    }
  }, [getAuthConfig, navigate, fetchError]);

  useEffect(() => {
    fetchAndFilterData();
  }, [fetchAndFilterData]);

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
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username, allUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'userType' && value !== 'Parent') {
      setFormData(prev => ({ ...prev, childRegNo: '' }));
    }
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (usernameStatus === 'taken') {
      setError('This username is already taken.'); return;
    }
    if (!formData.firstName || !formData.lastName || !formData.idNumber || !formData.userType || !formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.'); return;
    }
    if (formData.userType === 'Parent' && !formData.childRegNo) {
      setError('Please select a Patient for the Parent user type.'); return;
    }

    const config = getAuthConfig();
    if (!config) {
        setError("Authentication required to add user.");
        return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/add`, formData, config);
      setMessage(response.data.message || 'User added successfully!');
      setFormData({
        firstName: '', lastName: '', idNumber: '', userType: '', username: '',
        password: '', confirmPassword: '', childRegNo: ''
      });
      setUsernameStatus('idle');
      fetchAndFilterData();
    } catch (err) {
       if (err.response && err.response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/?message=session_expired');
      } else {
        setError(err.response?.data?.message || 'Something went wrong adding the user.');
        console.error("Error adding user:", err.response ? err.response.data : err.message);
      }
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderUsernameStatus = () => {
    switch (usernameStatus) {
      case 'checking':
        return <p style={{...styles.statusText, ...styles.statusChecking}}>Checking...</p>;
      case 'available':
        return <p style={{...styles.statusText, ...styles.statusAvailable}}>✔️ Available</p>;
      case 'taken':
        return <p style={{...styles.statusText, ...styles.statusTaken}}>❌ Taken</p>;
      default: return null;
    }
  };

  return (
    <div style={styles.pageContainer}>
        <div style={styles.container}>
            <h1 style={styles.heading}>Create a New User Account</h1>

            {message && <p style={styles.successMessage}>{message}</p>}
            {error && <p style={styles.errorMessage}>{error}</p>}
            {fetchError && !isLoadingPatients && <p style={styles.errorMessage}>{fetchError}</p>}


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
                        <label htmlFor="childRegNo" style={styles.label}>Assign Patient (Child No)</label>
                        {isLoadingPatients ? (
                            <p style={styles.loadingText}>Loading available patients...</p>
                        ) : availablePatients.length === 0 ? (
                           <p style={styles.errorMessage}>
                             {fetchError ? fetchError : 'No unassigned patients found or failed to load.'}
                           </p>
                        ) : (
                            <select id="childRegNo" name="childRegNo" value={formData.childRegNo} onChange={handleChange} required={formData.userType === 'Parent'} style={styles.select}>
                                <option value="">Select a Patient...</option>
                                {availablePatients.map((patient) => (
                                    <option key={patient._id} value={patient.childNo || patient.childRegNo}>
                                        {patient.name} ({patient.childNo || patient.childRegNo})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

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

                <button type="submit" style={styles.button} disabled={isSubmitting || usernameStatus === 'checking' || usernameStatus === 'taken'}>
                    {isSubmitting ? 'Adding User...' : 'Add New User'}
                </button>
            </form>
        </div>
    </div>
  );
}

const styles = {
 pageContainer: { background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' },
 container: { maxWidth: '700px', width: '100%', margin: '0 auto', padding: '30px 40px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
 heading: { textAlign: 'center', marginBottom: '25px', color: '#343a40', fontSize: '28px', fontWeight: 'bold' },
 form: { display: 'flex', flexDirection: 'column' },
 formGroup: { marginBottom: '20px', gridColumn: 'span 1' },
 label: { display: 'block', fontWeight: '600', color: '#495057', marginBottom: '8px', fontSize: '14px' },
 input: { width: '100%', padding: '12px 15px', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', transition: 'border-color 0.2s ease, box-shadow 0.2s ease', backgroundColor: '#f8f9fa' },
 select: { width: '100%', padding: '12px 15px', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#f8f9fa', cursor: 'pointer' },
 button: { padding: '15px 20px', background: 'linear-gradient(to right, #007bff, #0056b3)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', marginTop: '10px', transition: 'transform 0.2s ease, box-shadow 0.2s ease', width: '100%', opacity: 1 },
 button_disabled: { opacity: 0.6, cursor: 'not-allowed' },
 successMessage: { color: '#155724', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' },
 errorMessage: { color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' },
 gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
 usernameCheckContainer: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'flex-end' },
 statusMessageContainer: { paddingBottom: '20px', textAlign: 'left' },
 statusText: { margin: '0', fontSize: '14px', fontWeight: '600' },
 statusAvailable: { color: '#28a745' },
 statusTaken: { color: '#dc3545' },
 statusChecking: { color: '#6c757d' },
 loadingText: { color: '#495057', fontStyle: 'italic', paddingTop: '10px' }
};

styles.button[':disabled'] = styles.button_disabled;