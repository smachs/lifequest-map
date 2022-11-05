import { useState } from 'react';
import {
  Anchor,
  List,
  Modal,
  ScrollArea,
  Accordion,
  MantineProvider,
} from '@mantine/core';
import HelpIcon from '../icons/HelpIcon';
import classes from './FAQ.module.css';

const FAQ = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <MantineProvider
      theme={{
        colorScheme: 'dark',
      }}
    >
      <Modal
        zIndex={999999}
        centered
        opened={showModal}
        onClose={() => setShowModal(false)}
        title="FAQ"
        fullScreen
        styles={{
          modal: {
            overflow: 'hidden',
          },
        }}
      >
        <ScrollArea style={{ height: 'calc(100vh - 80px)' }}>
          <Accordion>
            <Accordion.Item value="The player position is not visible">
              <Accordion.Control>
                The player position is not visible
              </Accordion.Control>
              <Accordion.Panel>
                Please make sure that you fulfilled these requirements:
                <List type="ordered">
                  <List.Item>
                    Overwolf is running before you launch New World
                  </List.Item>
                  <List.Item>
                    You activated "Show FPS" in New World to support the screen
                    capturing fallback
                  </List.Item>
                  <List.Item>
                    Brightness and contrast at set to 5 in-game.
                  </List.Item>
                  <List.Item>
                    There are no other settings changing the colors of the game
                    like colorblind mode or HDR
                  </List.Item>
                  <List.Item>You started sharing in the app</List.Item>
                  <List.Item>You are signed in on app and website</List.Item>
                </List>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="New World freezes on launch">
              <Accordion.Control>New World freezes on launch</Accordion.Control>
              <Accordion.Panel>
                This is related to the screen capturing fallback, which is
                incompatible with GeForce Experience. Please deactivate GeForce
                Experience 😉. If this doesn't help, other apps with overlays or
                screen capturing could be the issue.
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="How to display hidden nodes?">
              <Accordion.Control>
                How to display hidden nodes?
              </Accordion.Control>
              <Accordion.Panel>
                You can use the search to only display hidden/discovered nodes.
                Select "is: hidden".
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="Setup Aeternum Map">
              <Accordion.Control>Setup Aeternum Map</Accordion.Control>
              <Accordion.Panel>
                <List type="ordered">
                  <List.Item>
                    Download the{' '}
                    <Anchor
                      href="https://www.overwolf.com/app/Leon_Machens-Aeternum_Map"
                      target="_blank"
                    >
                      Aeternum Map Overwolf app
                    </Anchor>
                  </List.Item>
                  <List.Item>
                    In the Overwolf app, please sign in with your steam account.
                  </List.Item>
                  <List.Item>
                    Generate a Token (You can share this token with friends and
                    then you will all be tracked and visible on the same map)
                  </List.Item>
                  <List.Item>
                    Make sure a server is selected (yellow = selected) it should
                    auto-select based on your ping and then click on Share.
                  </List.Item>
                  <List.Item>
                    Sign in with your Steam account on{' '}
                    <Anchor href="https://aeternum-map.gg/" target="_blank">
                      aeternum-map.gg
                    </Anchor>{' '}
                    (in any browser or device of your choice)
                  </List.Item>
                  <List.Item>
                    You position should be synced and visible.
                  </List.Item>
                </List>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="Setup Minimap with Skeleton">
              <Accordion.Control>Setup Minimap with Skeleton</Accordion.Control>
              <Accordion.Panel>
                <List type="ordered">
                  <List.Item>
                    Please follow instructions of "Setup Aeternum Map":
                  </List.Item>
                  <List.Item>
                    Download and unpack the latest version of{' '}
                    <Anchor
                      href="https://github.com/lmachens/skeleton/releases"
                      target="_blank"
                    >
                      Skeleton
                    </Anchor>{' '}
                    (skeleton-win32-x64.zip) and then run skeleton.exe
                  </List.Item>
                  <List.Item>
                    First, we'll add the the Big Map, this is needed so you can
                    change all the settings of the (Mini) Map; toggle markers,
                    routes, change settings. (can also be done in any browser of
                    your choice) URL: https://aeternum-map.gg/
                  </List.Item>
                  <List.Item>
                    And now the Mini Map, click on New Website. URL:
                    https://aeternum-map.gg/minimap.html
                  </List.Item>
                  <List.Item>
                    Toggle on the Big Map and sign in with your steam account
                  </List.Item>
                  <List.Item>Toggle on the Mini Map</List.Item>
                </List>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="The coordinates are not visible with Show FPS activated">
              <Accordion.Control>
                The coordinates are not visible with Show FPS activated
              </Accordion.Control>
              <Accordion.Panel>
                If you activate "Show FPS", the player coordinates should be
                displayed next to the FPS. If only the FPS is visible, please
                switch to windowed mode on a small resolution. Then while on the
                small resolution switch to fullscreen. (everything should look
                super big and blurry now). Then switch to your monitor's native
                resolution. (e.g. 1920x1080). All while keeping the Show FPS
                settings in the Visuals section active.
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="Is the node timer allowed?">
              <Accordion.Control>Is the node timer allowed?</Accordion.Control>
              <Accordion.Panel>
                It would not be allowed to read the timers from the game itself.
                But it's allowed to trigger a timer by hand (you need to press
                the action hotkey). You can not be sure that the node is farmed
                in the meantime with this approach, but it's safe to use.
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="I have a different issue!">
              <Accordion.Control>I have a different issue!</Accordion.Control>
              <Accordion.Panel>
                Please join the{' '}
                <Anchor href="https://discord.gg/NTZu8Px" target="_blank">
                  Discord
                </Anchor>{' '}
                for more support.
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </ScrollArea>
      </Modal>
      <button
        className={classes.button}
        onClick={() => setShowModal(true)}
        title="FAQ"
      >
        <HelpIcon />
      </button>
    </MantineProvider>
  );
};

export default FAQ;
