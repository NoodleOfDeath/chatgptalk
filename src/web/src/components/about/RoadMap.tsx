import * as React from 'react';

import { mdiCheck } from '@mdi/js';
import { Icon } from '@mdi/react';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@mui/lab';
import { Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';

import { MILESTONES } from './milestones';

export default function RoadMap() {
  return (
    <Timeline position="alternate">
      {MILESTONES.map((milestone) => (
        <TimelineItem key={ milestone.title }>
          <TimelineOppositeContent
            sx={ { m: 'auto 0' } }
            align="right"
            variant="body2"
            color="text.secondary">
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineConnector />
            <TimelineDot color="primary">
              {milestone.completed && <Icon path={ mdiCheck } size={ 1 } />}
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent sx={ { px: 2, py: '12px' } }>
            <Typography variant="h6" component="span">
              {milestone.title}
            </Typography>
            <ReactMarkdown>{milestone.description}</ReactMarkdown>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}