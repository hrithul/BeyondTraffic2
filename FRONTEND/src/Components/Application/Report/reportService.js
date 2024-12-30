import axios from 'axios';
import config from '../../../config';

export const createReport = async (reportData) => {
  try {
    const response = await axios.post(`${config.hostname}/reports`, {
      ...reportData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create report');
  }
};

export const getReports = async () => {
  try {
    const response = await axios.get(`${config.hostname}/reports`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch reports');
  }
};

export const updateReport = async (reportId, reportData) => {
  try {
    const response = await axios.put(`${config.hostname}/reports/${reportId}`, reportData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update report');
  }
};

export const deleteReport = async (reportId) => {
  try {
    await axios.delete(`${config.hostname}/reports/${reportId}`);
    return true;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete report');
  }
};
