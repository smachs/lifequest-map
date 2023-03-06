import {
  Card,
  createStyles,
  getStylesRef,
  Grid,
  Modal,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Map } from 'static';
import { AETERNUM_MAP, findMapDetails, mapDetails } from 'static';
import { isEmbed, useMap } from '../../utils/routes';
import useToMap from '../MapFilter/useToMap';

const useStyles = createStyles((theme) => {
  const image = getStylesRef('image');

  return {
    card: {
      position: 'relative',
      height: 120,
      width: 120,
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[6]
          : theme.colors.gray[0],

      [`&:hover .${image}`]: {
        transform: 'scale(1.03)',
      },
      [`@media (max-width: ${theme.breakpoints.sm})`]: {
        height: 80,
        width: 80,
      },
    },

    image: {
      ref: image,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'transform 500ms ease',
    },

    overlay: {
      position: 'absolute',
      top: '20%',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage:
        'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, .85) 90%)',
    },

    content: {
      height: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      zIndex: 1,
    },

    bodyText: {
      color: theme.colors.dark[2],
      marginLeft: 7,
    },

    author: {
      color: theme.colors.dark[2],
    },
  };
});

type MapCardProps = {
  mapDetail: Map;
  onClick: () => void;
  to?: string;
};
const MapCard = ({ mapDetail, onClick, to }: MapCardProps) => {
  const { classes } = useStyles();

  const card = (
    <Card withBorder p="xs" radius="md" className={classes.card}>
      <div
        className={classes.image}
        style={{
          backgroundImage: `url(/maps/${mapDetail.name.toLowerCase()}.webp)`,
        }}
      />
      <div className={classes.overlay} />
      <div className={classes.content}>
        <Text size="xs" weight={500} align="center">
          {mapDetail.title}
        </Text>
      </div>
    </Card>
  );

  return to ? (
    <UnstyledButton
      display="inline-block"
      component={Link}
      to={to}
      onClick={onClick}
    >
      {card}
    </UnstyledButton>
  ) : (
    <UnstyledButton onClick={onClick}>{card}</UnstyledButton>
  );
};

const MapAction = () => {
  const map = useMap();
  const toMap = useToMap();
  const [opened, setOpened] = useState(false);

  const mapDetail = findMapDetails(map) ?? AETERNUM_MAP;

  if (isEmbed) {
    return <></>;
  }

  return (
    <>
      <MapCard mapDetail={mapDetail} onClick={() => setOpened(true)} />
      <Modal
        title="Maps"
        centered
        opened={opened}
        onClose={() => setOpened(false)}
      >
        <Grid gutter="xs" justify="space-around">
          {mapDetails.map((mapDetail, index) => (
            <Grid.Col
              key={mapDetail.name}
              span={index === 0 ? 12 : 4}
              sx={{
                textAlign: 'center',
              }}
            >
              <MapCard
                mapDetail={mapDetail}
                to={toMap(mapDetail.title)}
                onClick={() => setOpened(false)}
              />
            </Grid.Col>
          ))}
        </Grid>
      </Modal>
    </>
  );
};

export default MapAction;
