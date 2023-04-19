<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->


<div align="center">

  <img src="https://github.com/RisticDjordje/betting-bot-client-server/blob/master/Media/logo/BettingLogo2.png" alt="logo" width="160" height="auto" />
  <h1>EZ Money ultimate live-bet placing app</h1>
  
  <p>
    Android app in Kotlin that allows dozens of users to connect to a scalable Node.js server and place instant live bets on multiple accounts and several betting sites simultaneously.
  </p>

---  
<!-- Badges -->
<p>
  <img alt="contributors" src="https://img.shields.io/github/contributors/RisticDjordje/betting-bot-client-server">
  <img alt="Commits" src="https://badgen.net/github/commits/RisticDjordje/betting-bot-client-server">
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/RisticDjordje/betting-bot-client-server">
  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/RisticDjordje/betting-bot-client-server">  
  <img alt="GitHub issues" src="https://img.shields.io/github/issues/RisticDjordje/betting-bot-client-server">
  <img alt="Languages count" src="https://img.shields.io/github/languages/count/RisticDjordje/betting-bot-client-server">
  <img alt="Language top" src="https://img.shields.io/github/languages/top/RisticDjordje/betting-bot-client-server">
  <img alt="Lines of code" src="https://img.shields.io/tokei/lines/github/RisticDjordje/betting-bot-client-server">
</p> 
</div> 

---
<!--
<h4>
    <a href="https://github.com/Louis3797/awesome-readme-template/">View Demo</a>
  <span> · </span>
    <a href="https://github.com/Louis3797/awesome-readme-template">Documentation</a>
  <span> · </span>
    <a href="https://github.com/Louis3797/awesome-readme-template/issues/">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/Louis3797/awesome-readme-template/issues/">Request Feature</a>
  </h4>
-->

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#demo">Demo</a></li>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#features">Features</a></li>
    <!--<li><a href="#roadmap">Roadmap</a></li> -->
    <li><a href="#contributors">Contributors</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>
<br>


<!-- DEMO -->
## Demo

![](https://github.com/RisticDjordje/betting-bot-client-server/blob/master/Media/demo/demo.gif)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
<br>

<!-- ABOUT THE PROJECT -->
## About The Project

This project has 2 parts: 
1. **Client**: 
   - Android app that allows users to connect to the *server*, log-in into several accounts, choose a match, choose an offer, see what funds they currently have on their accounts and place an *instant* live bet on all of their account *simultaneuously*.
2. **Server**: 
    - Highly-scalable server that allows dozens of users to connect. 
    - Listens to *client* signals to log-in, choose a match/offer, place bets and many more.
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<br>

<!-- BUILT WITH -->
## Built With

#### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Client
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ![Kotlin][Kotlin]
  ![Java][Java]
  ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
  

#### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Server
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ![javascript][javascript]
  ![node.js][Node.js]
  ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
  <img src="https://a11ybadges.com/badge?logo=puppeteer" alt="puppeteer" width="94.5" height="28"/>
   ![express.js][express.js]
  

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Features

#### Client
- [x] Realtime updates refecting the latest changes on betting websites.
- [x] Ability to choose which "ip" address to connect to.
- [x] Choose which account to connect to.
- [x] Choose one of the matches currently available.
- [x] Console to get instant updates from the server and other notifications.
- [x] Ability to control the app only using volume up/down buttons.
- [x] Ability to make the screen black and continue using the app.
- [x] Sound notifications for the result of the bet.
- [x] Check current available funds at each of your accounts.
- [x] Ability to choose the live bet offer.
- [x] Caching of previous choices (ip adress, username, match) to make the UX smoother.

#### Server
- [x] Highly-scalable allowing 16+ users to be connected simultaneusly.
- [x] Fault-tolerant! If one of the processes/workers dies, another one automatically takes over the load and continues the processes.
- [x] Full overview of every actions.
- [x] Ability to turn the GUI on/off.
- [x] Custom or random amount to place as a bet.
<br><br>

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP
## Roadmap

- [x] Add Changelog


<p align="right">(<a href="#readme-top">back to top</a>)</p>
 -->


<!-- CONTRIBUTING -->
## Contributors
  <a href="https://github.com/risticdjordje"><img src="https://avatars.githubusercontent.com/u/38117050?v=4" alt="Djordje Ristic" width="130" height="130"></a> | <a href="https://github.com/spuksiii"><img src="https://avatars.githubusercontent.com/u/106120544?v=4" alt="Relja Vranjes" width="130" height="130"></a> | <a href="https://github.com/MilosMaljak"><img src="https://avatars.githubusercontent.com/u/127912059?v=4" alt="Milos Maljak" width="130" height="130"></a> 
---|---|---
[RisticDjordje](https://github.com/risticdjordje) | [Relja Vranjes](https://github.com/spuksiii) | [MilosMaljak](https://github.com/MilosMaljak)
<p align="right">(<a href="#readme-top">back to top</a>)</p>
<br>

<!-- CONTACT -->
## Contact
<br>
<div align="center">
<p align="center">
<a href="https://www.linkedin.com/in/djordjeristic/"><img src="https://img.shields.io/badge/-Djordje%20Ristic-0077B5?style=for-the-badge&logo=Linkedin&logoColor=white"/></a>
<a href="https://www.linkedin.com/in/reljavranjes/"><img src="https://img.shields.io/badge/-Relja%20Vranjes-0077B5?style=for-the-badge&logo=Linkedin&logoColor=white"/></a>
<a href="https://www.linkedin.com/in/milos-maljak/"><img src="https://img.shields.io/badge/-Milos%20Maljak-0077B5?style=for-the-badge&logo=Linkedin&logoColor=white"/></a>
<br>
<a href="mailto:rist.djordje@gmail.com"><img src="https://img.shields.io/badge/-rist.djordje@gmail.com-D14836?style=for-the-badge&logo=Gmail&logoColor=white"/></a>
<a href="https://twitter.com/itsdjordje"><img src="https://img.shields.io/badge/-itsdjordje-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white"/></a>

</p>
</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS 
## Acknowledgments

Use this space to list resources you find helpful and would like to give credit to.

* [Choose an Open Source License](https://choosealicense.com)
* [GitHub Emoji Cheat Sheet](https://www.webpagefx.com/tools/emoji-cheat-sheet)
* [Malven's Flexbox Cheatsheet](https://flexbox.malven.co/)
* [Malven's Grid Cheatsheet](https://grid.malven.co/)
* [Img Shields](https://shields.io)
* [GitHub Pages](https://pages.github.com)
* [Font Awesome](https://fontawesome.com)
* [React Icons](https://react-icons.github.io/react-icons/search)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
-->


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/RisticDjordje/betting-bot-client-server.svg?style=for-the-badge
[contributors-url]: https://github.com/RisticDjordje/betting-bot-client-server/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/RisticDjordje/betting-bot-client-server.svg?style=for-the-badge
[forks-url]: https://github.com/RisticDjordje/betting-bot-client-server/network/members
[stars-shield]: https://img.shields.io/github/stars/RisticDjordje/betting-bot-client-server.svg?style=for-the-badge
[stars-url]: https://github.com/RisticDjordje/betting-bot-client-server/stargazers
[issues-shield]: https://img.shields.io/github/issues//RisticDjordje/betting-bot-client-server.svg?style=for-the-badge
[issues-url]: https://github.com/RisticDjordje/betting-bot-client-server/issues
[license-shield]: https://img.shields.io/github/license/RisticDjordje/betting-bot-client-server.svg?style=for-the-badge
[license-url]: https://github.com/RisticDjordje/betting-bot-client-server/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/djordjeristic
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
[Kotlin]: https://img.shields.io/badge/Kotlin-0095D5?&style=for-the-badge&logo=kotlin&logoColor=white
[Java]: https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white
[Node.js]: https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white
[javascript]: https://img.shields.io/badge/JavaScript%20-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black
[express.js]: https://img.shields.io/badge/Express.js-404D59?style=for-the-badge

