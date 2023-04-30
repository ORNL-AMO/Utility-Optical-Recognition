# Utility-Optical-Recognition

This tool is an addition to [Verifi by Oak Ridge National Lab](https://github.com/ORNL-AMO/VERIFI). 

This tool aims to automate the process of obtaining utility bill data. It uses optical character recognition (OCR) through Tesseract.js to extract relevant bill attributes.

This tool provides an interface that allows you to upload a PDF, save the locations of the attributes, and save the profile for later use. Then you can upload each month's new utility bill and automatically extract the bill's data for use within Verifi.



## Build & Installation

No additional commands needed. Please follow Verifi's instructions further below.


## Usage Instructions

When adding a new bill into Verifi, the option "Upload PDF" will appear. This option will allow you to create a reusable scan profile that will extract the bill's utility data.

### New Scan Profile
To start a new scan profile, select "New Scan Profile." Save a unique name for this utility bill and select a PDF to upload. Then, select the attribute you would like to extract and create a snippet. Repeat this step for every attribute you want to include. Once complete, click "Save Profile Changes." On the next page, you can edit the extracted data. Click "Confirm Save" when you are done.

### Reuse Scan Profile
To reuse a scan profile, click on the saved scan profile name you would like to use. Then, upload the new utility bill that matches this scan profile type. Select the attributes you want to extract. Once complete, click "Save Profile Changes." On the next page, you can edit the extracted data. Click "Confirm Save" when you are done.

### Edit Scan Profile
To edit a scan profile, click on the saved scan profile name you would like to edit. Then, upload a utility bill that matches this scan profile type. Select the attribute you would like to edit. When you are in a snippet, you are able to change where the snippet pulls from. Once complete, click "Save Profile Changes." On the next page, you can edit the extracted data. Click "Confirm Save" when you are done.

### Delete Scan Profile
To delete a scan profile, click on the saved scan profile name you would like to delete. Then, click the "Delete" button. Upon refresh, the scan profile should no longer appear.


### Additional Dependencies

In addition to the dependencies of VERIFI, we used the following.

 - ngx-image-cropper
 - ng2-pdf-viewer
 - html2canvas
 - tesseract.js

 ## Acknowledgments

A special thank you to Gina Accawi, Kristina Armstrong, and Mark Root with Oak Ridge National Lab (ORNL). Your guidance and feedback through our first open-source contribution was vital to its success. We appreciate everything you have done for us.



# Verifi
### Downloads  ![Github Releases](https://img.shields.io/github/downloads/ORNL-AMO/VERIFI/latest/total.svg?label=Current%20Release)  ![Github All Releases](https://img.shields.io/github/downloads/ORNL-AMO/VERIFI/total.svg?label=All%20Time&colorB=afdffe)

The Department of Energy Advanced Manufacturing Office has tasked Oak Ridge National Laboratory to develop a tool to track, visualize, analyze and even forecast facility utility data in industrial settings. This tool will incorporate and expand on several existing DOE tools (EnPI, EnPI Lite, Energy Footprint Tool, Plant Energy Profiler), most of which currently are excel-based or excel-add ons. This project will integrate them into a common, open-source framework which is harmonized with other DOE software tools – mainly the DOE’s [MEASUR tool suite](https://github.com/ORNL-AMO/AMO-Tools-Desktop).

## Dependencies
- Node.js (https://nodejs.org/en/) (v14.18.2 is best option)


## Build
- To install all required packages: `npm install`

- Built artifacts will be stored in the `/dist` directory.

- General build for electron `npm run build`

- Production Web Build `npm run build-prod`

- Production Electron Build `npm run build-prod-electron`



## Native Installers

- `npm run dist` will create electron installers for your operating system

- Installer will be created in an `/output/verifi/` directory in the parent directory you run the command in


## Running tests

- Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

- Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).


## For Developers

- When developing in electron window use `npm run build-watch` and a re-build will trigger on save of changes

- To start the electron app (kill and restart app after rebuild on save): `npm run electron`

- When developing for web run `npm run start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

- Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

- For more information, see [the angular docs](https://docs.angularjs.org/guide/component)


### Mac Code Signing
- Run `electron-builder -m` to build and sign your mac dmg.

- Run `xcrun altool --notarize-app --primary-bundle-id "com.ornl.verifi" --username "<APPLE USERNAME>" --password "<APPLE APP PASSWORD>" --file VERIFI-x.x.x-x.dmg -itc_provider "<CERT UID>" --verbose` to notarize your signed dmg.

- Run `xcrun stapler staple VERIFI-x.x.x-x.dmg` to staple the notarization. 

> **Note:** APPLE APP PASSWORD is an [app-specific password](https://support.apple.com/en-us/HT204397) (not your Apple ID password).