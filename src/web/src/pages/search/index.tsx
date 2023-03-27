import React from 'react';

import {
  Button,
  CircularProgress,
  Grid,
  Stack,
  Theme,
  Typography,
  styled,
  useMediaQuery,
} from '@mui/material';

import API, { InteractionResponse, SummaryResponse } from '@/api';
import Post, { ConsumptionMode } from '@/components/Post';
import Page from '@/components/layout/Page';
import Filters from '@/components/search/Filters';
import { SessionContext } from '@/contexts';
import { useRouter } from '@/next/router';

const StyledGrid = styled(Grid)(() => ({
  alignItems: 'center',
  justifyContent: 'center',
  margin: 'auto',
  width: 'calc(100% - 16px)',
}));

export default function SearchPage() {
  const { searchParams } = useRouter();

  const { 
    searchText, 
    setSearchText,
    userData,
    withHeaders,
  } = React.useContext(SessionContext);

  const [totalResults, setTotalResults] = React.useState<number>(0);
  const [recentSummaries, setRecentSummaries] = React.useState<SummaryResponse[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [pageSize] = React.useState<number>(10);
  const [page, setPage] = React.useState<number>(1);

  const [expandedPost, setExpandedPost] = React.useState<number|undefined>();
  const [consumptionMode, setConsumptionMode] = React.useState<ConsumptionMode|undefined>();

  const mdAndUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));

  const gridSize = React.useMemo(() => {
    return mdAndUp ? (recentSummaries.length < 2 ? 12 : 6) : 12;
  }, [recentSummaries, mdAndUp]);

  React.useEffect(() => {
    if (searchParams['q']) {
      setSearchText(JSON.stringify(searchParams['q']) || '');
    }
  }, [searchParams, setSearchText]);

  React.useEffect(() => {
    setRecentSummaries([]);
    setPage(1);
    withHeaders(API
      .getSummaries)({
      filter: searchText,
      page: 0,
      pageSize,
    })
      .then((response) => {
        setTotalResults(response.data.count);
        setRecentSummaries(response.data.rows);
      })
      .catch((error) => {
        console.error(error);
        setTotalResults(0);
        setRecentSummaries([]);
      })
      .finally(() => {
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, withHeaders]);

  const expandPost = React.useCallback((id?: number, mode?: ConsumptionMode) => {
    setExpandedPost(mode ? id : undefined);
    setConsumptionMode(mode);
  }, []);

  const loadMore = React.useCallback(async () => {
    withHeaders(API
      .getSummaries)({
      filter: searchText,
      page,
      pageSize,
    })
      .then(({ data, error }) => {
        if (data) {
          setTotalResults(data.count);
          setRecentSummaries((prev) => [...prev, ...data.rows]);
          setPage((prev) => prev + 1);
        }
      })
      .catch(console.error);
  }, [page, pageSize, searchText, withHeaders]);
  
  const setPostInteractions = React.useCallback((i: number, interactions: InteractionResponse) => {
    setRecentSummaries((prev) => {
      const newPosts = [...prev];
      newPosts[i].interactions = interactions;
      return (prev = newPosts);
    });
  }, []);

  return (
    <Page center>
      <Stack spacing={ 2 }>
        <Typography variant="h4">News that fits your schedule</Typography>
        <Filters />
        <StyledGrid container justifyContent="center" spacing={ 2 }>
          {expandedPost === undefined ? recentSummaries.map((summary, i) => (
            <Grid key={ summary.id } item xs={ gridSize }>
              <Post 
                summary={ summary }
                onChange={ (mode) => expandPost(i, mode) } 
                onInteract={ (interactions) => setPostInteractions(i, interactions) } />
            </Grid>
          )) : (
            <Grid item xs={ 12 }>
              <Post
                summary={ recentSummaries[expandedPost] }
                onChange={ (mode) => expandPost(expandedPost, mode) }
                consumptionMode={ consumptionMode } 
                onInteract={ (interactions) => setPostInteractions(expandedPost, interactions) } />
            </Grid>
          )}
          {loading && <CircularProgress size={ 10 } variant="indeterminate" />}
        </StyledGrid>
        {expandedPost === undefined && totalResults > pageSize * page && (
          <Button onClick={ () => loadMore() }>Load More</Button>
        )}
      </Stack>
    </Page>
  );
}
