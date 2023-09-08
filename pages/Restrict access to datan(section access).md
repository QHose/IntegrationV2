
[Section Access](https://help.qlik.com/en-US/cloud-services/Subsystems/Hub/Content/Sense_Hub/Scripting/Security/manage-security-with-section-access.htm) is used to control the security of an application. It is basically a part of the data load script where you add a security table to define who gets to see what. Qlik Cloud uses this information to reduce data to the appropriate scope when the user opens the application, that is, some of the data in the app is hidden from the user based on their identity. Section Access is tightly integrated with the data in the app and relies upon it to control access. This form of dynamic data reduction can target table rows, columns, or a combination of both.

[View this video on YouTube](https://youtu.be/0VoJPiRrqKA)

The general idea can be seen in this image borrowed from the Qlik Sense on Windows environment (the userId is different there)

![image](https://user-images.githubusercontent.com/12411165/230038838-cb7d5098-a505-4ff0-878d-6d322415816a.png)

## Section Access in SaaS
SaaS also supports SA for dynamic data reduction. The mechanism works identical i.e. Qlik engine reducing the app's dataset on the fly when user logins, however, there are some differences compared to client-managed when building the security table in the load script. This difference is mainly in the systems fields available and data values to be used.

In SaaS the SA security table must contain, as a minimum, two system fields:
- ACCESS
- USERID or __USER.EMAIL__

The other system fields are optional:
- USERID
- NTNAME
- GROUP
- OMIT  

### **Important Considerations:**

- SERIAL system field is not available in SaaS
- USERID is not a mandatory system field 
- Use either USERID or USER.EMAIL (not both) for user-level security​
- Use GROUP for group-level security when using a custom IdP or JWT
- USERID is always compared to the value in the **IdP subject**. The **IdP subject** field can be used for distinguishing one user from another if the names are identical and the email field is not visible.
    - When using Qlik Account, the **IdP subject** can be viewed in the **Management Console** under the **Users** section.
    - When using a custom IdP, the **IdP subject** can be mapped to match your internal Windows identity e.g. DOMAIN/USERNAME
    - When using JWT authentication, the IdP subject will be set in the `sub` claim of the user payload. Example of JWT payload is shown below. Note that it uses the **email address** in both the `sub` and `email` claim, however, the subject could be mapped to the user's **internal Windows identity**.  

            {  
            "jti": "k5bU_cFI4_-vFfpJ3DjDsIZK-ZhJGRbBfusUWZ0ifBI"
            "sub": "mike.johnson@acme.com",   
            "subType": "user",    
            "name": "Mike Johnson",   
            "email": "mike.johnson@acme.com",    
            "email_verified": true,    
            "groups": ["Presales"]  
            }

> USER.EMAIL contains the user email address which will be obtained from the configured identity provider. If SA table in SaaS needs to apply restrictions at the user level, using USER.EMAIL rather than USERID is a good options since it avoids having to deal with the value set in the `subject claim` which may vary depending on the configure identity provider.

To learn more details about how to work with SA in SaaS please visit our [Online Help](https://help.qlik.com/en-US/cloud-services/Subsystems/Hub/Content/Sense_Hub/Scripting/Security/manage-security-with-section-access.htm)

&nbsp;
***