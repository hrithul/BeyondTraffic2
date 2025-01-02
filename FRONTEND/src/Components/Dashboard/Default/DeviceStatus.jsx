import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardTitle, Spinner, Table } from 'reactstrap';
import { formatDistanceToNow } from 'date-fns';
import axios from '../../../utils/axios';

const DeviceStatus = () => {
  const [syncData, setSyncData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLastSync = async () => {
      try {
        const response = await axios.get('/device/lastsync');
        if (response.data.success) {
          setSyncData(response.data.data);
        } else {
          setError('Failed to fetch device sync status');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching device sync status:', err);
        setError('Failed to connect to server. Please try again later.');
        setLoading(false);
      }
    };

    fetchLastSync();
    // Refresh every 5 minutes
    const interval = setInterval(fetchLastSync, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatLastSync = (date, time) => {
    if (!date || !time) return 'Never';
    try {
      const dateTime = new Date(date + 'T' + time);
      return formatDistanceToNow(dateTime, { addSuffix: true });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Card className="mt-3">
        <CardBody className="text-center">
          <Spinner color="primary" />
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-3">
        <CardBody>
          <p className="text-danger">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="mt-3">
      <CardBody>
        <CardTitle tag="h5" className="mb-3 text-center">Device Status</CardTitle>
        {syncData && syncData.length > 0 ? (
          <Table responsive rounded hover bordered className="mb-0 rounded-sm">
            <thead className="text-center">
              <tr>
                <th>Device ID</th>
                <th>Region</th>
                <th>Store</th>
                <th>Last Sync</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {syncData.map((device, index) => {
                const lastSyncTime = formatLastSync(device.last_sync_date, device.last_sync_time);
                const isOffline = lastSyncTime === 'Never' || 
                  lastSyncTime.includes('hour') || 
                  lastSyncTime.includes('day') || 
                  lastSyncTime.includes('month');

                return (
                  <tr key={index} className="text-center">
                    <td>{device.deviceId}</td>
                    <td>{device.region || 'N/A'}</td>
                    <td>{device.store_code || 'N/A'}</td>
                    <td>{lastSyncTime}</td>
                    <td>
                      <span className={`badge bg-${isOffline ? 'danger' : 'success'}`}>
                        {isOffline ? 'Offline' : 'Online'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted">No device sync data available</p>
        )}
      </CardBody>
    </Card>
  );
};

export default DeviceStatus;
