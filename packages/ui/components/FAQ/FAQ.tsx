import { Accordion, Anchor, List } from '@mantine/core';

export default function FAQ() {
  return (
    <Accordion>
      <Accordion.Item value="How to deactivate ads?">
        <Accordion.Control>How to deactivate ads?</Accordion.Control>
        <Accordion.Panel>
          Become a supporter on{' '}
          <Anchor href="https://www.th.gl/support-me" target="_blank">
            Patreon
          </Anchor>{' '}
          to disable ads and get the Discord supporter role 🤘
        </Accordion.Panel>
      </Accordion.Item>

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
            <List.Item>You are signed in on app and website</List.Item>
          </List>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="How to display hidden nodes?">
        <Accordion.Control>How to display hidden nodes?</Accordion.Control>
        <Accordion.Panel>
          You can use the search to only display hidden/discovered nodes. Select
          "is: hidden".
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
              Generate a Token (You can share this token with friends and then
              you will all be tracked and visible on the same map)
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
            <List.Item>You position should be synced and visible.</List.Item>
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
              First, we'll add the the Big Map, this is needed so you can change
              all the settings of the (Mini) Map; toggle markers, routes, change
              settings. (can also be done in any browser of your choice) URL:
              https://aeternum-map.gg/
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
      <Accordion.Item value="Is the node timer allowed?">
        <Accordion.Control>Is the node timer allowed?</Accordion.Control>
        <Accordion.Panel>
          It would not be allowed to read the timers from the game itself. But
          it's allowed to trigger a timer by hand (you need to press the action
          hotkey). You can not be sure that the node is farmed in the meantime
          with this approach, but it's safe to use.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="Can not sign-in on Safari">
        <Accordion.Control>Can not sign-in on Safari</Accordion.Control>
        <Accordion.Panel>
          You have to go to settings app on iOS and to Safari settings and
          toggle off pop-up blocker.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="Skeleton causes some lags in New World">
        <Accordion.Control>
          Skeleton causes some lags in New World
        </Accordion.Control>
        <Accordion.Panel>
          Please make sure to deactivate "Cap FPS in Background" in New World
          settings.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="I want to update my username">
        <Accordion.Control>I want to update my username</Accordion.Control>
        <Accordion.Panel>
          Your username is your Steam Profile Name. If you updated it on Steam,
          you need to sign-out and sign-in on aeternum-map.gg.
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
  );
}
