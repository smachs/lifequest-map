# Overwolf

The app is using the Overwolf API and is available on [Overwolf](https://www.overwolf.com/app/Leon_Machens-Aeternum_Map).
Please follow the instructions on [Overwolf Developer](http://developers.overwolf.com/documentation/odk-2-0-introduction/creating-your-first-app/) to get white listed in Overwolf if you like to contribute. Then you can start developing!

You can start by copying the template environment variables file.

```
cp template.env .env
```

The following list shows the variables you need to set:

| KEY                     | VALUE                            |
| ----------------------- | -------------------------------- |
| PORT                    | Port for the server environment  |
| VITE_API_ENDPOINT       | URL of your server environment   |
| VITE_PLAUSIBLE_API_HOST | Hostname of Plausible service    |
| VITE_PLAUSIBLE_DOMAIN   | Name of the website on Plausible |

### Install as "unpacked extension"

Based on this [guide](https://overwolf.github.io/docs/start/sample-app-overview#5-install-the-app-as-unpacked-extension) you can install the app.

- Open the Overwolf desktop client settings (by right-clicking the client and selecting "Packages"
  Or by clicking on the wrench icon in the dock and going to the "About" tab => "Development Options").

- Click on "Development options".

- In the opened window, click on "Load unpacked extension" and select the extracted '/apps/overwolf' or '/apps/overwolf/dist' folder.
  This will add the app to your Overwolf dock.

- Make sure you are logged in to the OW client. Otherwise, you will get an "Unauthorized App" error message. (Click on the "Appstore" icon in the OW dock to login to the OW client).
