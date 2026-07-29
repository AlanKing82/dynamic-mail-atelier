# Template Studio

## Page Layout

The application already has a primary navigation menu on the left side.

Do NOT add the Email Builder component panel to the left.

The Email Template Builder page should use this layout:

-------------------------------------------------

| Existing App Main Menu | Email Builder         |

| (left sidebar)         |                       |

|                        | Template Canvas       |

|                        |                       |

|                        |                       |

|                        |-----------------------|

|                        | Component Panel       |

|                        | (right sidebar)      |

-------------------------------------------------

The Email Builder workspace should contain:

1. Centre:

Email preview canvas

2. Right sidebar:

Reusable email components and properties

The right sidebar should contain:

- Components tab

- Properties tab

- Template variables tab

---

## Existing Template Preview

The builder must also support viewing existing email templates.

Add an "Existing Templates" section/page.

Users should be able to:

- Browse existing templates

- Search templates

- Filter by product/trigger/event

- Select a template

- Preview the rendered email

Example structure:

Product:

Weather At Destination

Trigger:

EXANTE-TRIGGER-WEATHER-AT-DESTINATION

Templates:

trip/start

trip/end

trip/added

payment

account-creation

---

## Existing Template Preview Behaviour

When a user selects an existing template:

Display:

1. Rendered email preview

The HTML should be displayed as an actual email preview:

- 550px max width

- White email container

- Grey background

- Responsive email styling

2. Template metadata:

Example:

Template Name:

Weather Cover Started

Product:

Weather At Destination

Trigger:

EXANTE-TRIGGER-WEATHER-AT-DESTINATION

Event:

trip/start

3. Actions:

- Preview HTML

- View source HTML

- Duplicate template

- Edit in builder

---

## Loading Existing Templates

Assume templates are available through an API.

Create a service layer:

GET:

 /api/email-templates

Returns:

{

 id,

 name,

 product,

 trigger,

 event,

 html,

 json

}

The initial implementation can use mocked API data.

The service should later support loading templates from AWS-backed storage.

---

## Edit Existing Templates

When selecting:

"Edit in Builder"

The system should:

- Parse the existing template into builder blocks where possible

- If parsing is not possible, open as HTML preview with a warning:

  "This template cannot be fully converted into editable blocks. You can duplicate it and create a new template."

The builder should support editing newly created templates first.

---

## Right Sidebar Components

Move all builder components to the right sidebar.

Components:

- Columns

- Heading

- Text Block

- Image

- Button

- Divider

Components should be draggable from the right sidebar into the email canvas.

---

## Template Workflow

Support these flows:

### Create new template

User opens Email Template Builder:

1. Select product

2. Select trigger/event

3. Build email using components

4. Preview

5. Save

---

### Edit existing template

User:

1. Opens Existing Templates

2. Selects template

3. Previews email

4. Clicks Edit/Duplicate

5. Opens builder

---

## Priority

The first version should focus on:

1. Existing template preview

2. Visual email builder

3. Static HTML generation

4. Template save/load structure

Avoid implementing a full HTML parser initially.

reference: 
https://semplates.io/editor?template=Semplates%20Demo%20Template
An example of an existing email template:

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <!--<![endif]-->
    <!--[if (gte mso 9)|(IE)]>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <!--[if (gte mso 9)|(IE)]>
    <style type="text/css">
      body {width: 550px;margin: 0 auto;}
      table {border-collapse: collapse;}
      table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
      img {-ms-interpolation-mode: bicubic;}
    </style>
    <![endif]-->
    <style type="text/css">
      body, p, div {
        font-family: arial, helvetica, sans-serif;
        font-size: 14px;
      }
      body {
        color: #000000;
      }
      body a {
        color: #1188E6;
        text-decoration: none;
      }
      p { margin: 0; padding: 0; }
      table.wrapper {
        width: 100% !important;
        table-layout: fixed;
        -webkit-font-smoothing: antialiased;
        -webkit-text-size-adjust: 100%;
        -moz-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      img.max-width {
        max-width: 100% !important;
      }
      @media screen and (max-width:480px) {
        table.wrapper-mobile {
          width: 100% !important;
          table-layout: fixed;
        }
        img.max-width {
          height: auto !important;
          max-width: 100% !important;
        }
        a.bulletproof-button {
          display: block !important;
          width: auto !important;
          font-size: 80%;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      }
    
  
  
    
      


        


          
            
              


                
                  
                    
                    


                      
                        

                          
                          


                            
                              
                                
                              
                            
                          



                          
                          


                            
                              
                                


                                  Your Weather at Destination Cover Starts Now.
                                


                              
                            
                          



                          
                          


                            
                              
                                


                                  Hello {{#if display_name}}{{display_name}}{{else}}Client{{/if}},
                                


                              
                            
                          



                          
                          


                            
                              
                                


                                  We hope that the weather during your trip to {{tripDestination}} is everything you hope it will be.
                                


                              
                            
                          



                          
                          


                            
                              
                                


                                  Your Weather At Destination cover will be active from {{tripStartDate}} until {{tripEndDate}}.
                                


                                





                                


                                  We hope you donâ€™t get bad weather but if you do we will contact you directly with payment.
                                


                              
                            
                          



                          
                          


                            
                              
                                {{#if tripTypeGroup}}
                                


                                  You can monitor this Group Trip policy in the Policy Portal by clicking the link below.
                                


                                {{else}}
                                  {{#if tripTypeMulti}}
                                  


                                    You can monitor this trip, or add another trip, in the Policy Portal by clicking the link below.
                                  


                                  {{else}}
                                  


                                    You can monitor this Single Trip policy in the Policy Portal by clicking the link below.
                                  


                                  {{/if}}
                                {{/if}}
                              
                            
                          



                          
                          


                            
                              
                                

Kind Regards,


                              
                            
                          


                          


                            
                              
                                

Customer Care Team


                              
                            
                          



                          
                          


                            
                              
                                


                                  
                                    
                                      Open Policy Portal

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/99d67ec4-170f-4d13-b78c-c27f9976019f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
