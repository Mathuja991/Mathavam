const MonthlyReturn = require('../models/MonthlyReturn');

// Create new six-month return
exports.createMonthlyReturn = async (req, res) => {
  try {
    console.log('Received data:', req.body); // Debug log
    
    const { period, year, entries, signature } = req.body;
    
    // Basic validation
    if (!period || !year || !signature) {
      console.log('Missing fields:', { period, year, signature });
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    // Create new return
    const newReturn = new MonthlyReturn({
      period,
      year,
      entries: entries || [],
      signature
    });

    const savedReturn = await newReturn.save();
    console.log('Saved successfully:', savedReturn._id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Six-month return submitted successfully!', 
      data: savedReturn 
    });
    
  } catch (error) {
    console.error('Error in createMonthlyReturn:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all monthly returns
exports.getMonthlyReturns = async (req, res) => {
  try {
    const returns = await MonthlyReturn.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: returns });
  } catch (error) {
    console.error('Error in getMonthlyReturns:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete monthly return
exports.deleteMonthlyReturn = async (req, res) => {
  try {
    const monthlyReturn = await MonthlyReturn.findByIdAndDelete(req.params.id);
    if (!monthlyReturn) {
      return res.status(404).json({ success: false, message: 'Monthly Return not found' });
    }
    res.status(200).json({ success: true, message: 'Monthly Return deleted successfully' });
  } catch (error) {
    console.error('Error in deleteMonthlyReturn:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};