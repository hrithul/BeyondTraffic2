import axios from '../../../utils/axios';
import config from '../../../config';

export const createReport = async (reportData) => {
  try {
    const response = await axios.post(`/reports`, {
      ...reportData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to create report');
  }
};

export const getReports = async () => {
  try {
    const response = await axios.get(`/reports`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch reports');
  }
};

export const updateReport = async (reportId, reportData) => {
  try {
    const response = await axios.put(`/reports/${reportId}`, reportData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to update report');
  }
};

export const deleteReport = async (reportId) => {
  try {
    await axios.delete(`/reports/${reportId}`);
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to delete report');
  }
};
