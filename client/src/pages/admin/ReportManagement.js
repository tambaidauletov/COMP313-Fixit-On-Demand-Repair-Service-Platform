import React from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';

const ReportManagement = () => {
  // Sample report data
  const reports = [
    { id: 1, reportedBy: 'User A', type: 'listing', reason: 'Inappropriate content', status: 'pending', date: '2023-05-15' },
    { id: 2, reportedBy: 'User B', type: 'message', reason: 'Harassment', status: 'under_review', date: '2023-05-14' },
    { id: 3, reportedBy: 'User C', type: 'user', reason: 'Fake profile', status: 'resolved', date: '2023-05-10' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Report Management
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Reported By</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.id}</TableCell>
                <TableCell>{report.reportedBy}</TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>{report.reason}</TableCell>
                <TableCell>{report.status.replace('_', ' ')}</TableCell>
                <TableCell>{report.date}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" color="primary" sx={{ mr: 1 }}>
                    Review
                  </Button>
                  <Button size="small" variant="outlined" color="error">
                    Dismiss
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ReportManagement; 