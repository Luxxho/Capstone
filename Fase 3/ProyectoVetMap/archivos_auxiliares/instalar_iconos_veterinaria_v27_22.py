# -*- coding: utf-8 -*-
"""VetMap V27.22 — Iconos internos de Veterinaria.
Ejecutar en la carpeta ProyectoVetMap. Solo cambia web/src/main.jsx y agrega
web/src/components/VetMapV27Icons.jsx + web/src/vetmap_v27_22_iconos_veterinaria.css.
No modifica .env, backend, PostgreSQL, móvil, ni fotografías de pacientes.
"""
from pathlib import Path
from datetime import datetime
import base64, json, re, shutil, sys

ICON_DATA = "aW1wb3J0IFJlYWN0IGZyb20gInJlYWN0IjsKCi8qIFZldE1hcCBWMjcuMjI6IGljb25vcyBTVkcgcmVhbGVzOyBzaW4gZGVwZW5kZW5jaWFzLCBlbW9qaXMgbmkgaW3DoWdlbmVzIGV4dGVybmFzLiAqLwpleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBWZXRNYXBWMjdJY29uKHsgbmFtZSA9ICJwYXciLCBjbGFzc05hbWUgPSAiIiwgc2l6ZSA9IDI0IH0pIHsKICBjb25zdCBjb21tb24gPSB7IGZpbGw6ICJub25lIiwgc3Ryb2tlOiAiY3VycmVudENvbG9yIiwgc3Ryb2tlV2lkdGg6IDEuOSwgc3Ryb2tlTGluZWNhcDogInJvdW5kIiwgc3Ryb2tlTGluZWpvaW46ICJyb3VuZCIgfTsKICBjb25zdCBpY29ucyA9IHsKICAgIHVzZXI6IDw+PGNpcmNsZSBjeD0iMTIiIGN5PSI3LjUiIHI9IjQiLz48cGF0aCBkPSJNNC41IDIxdi0xYTcuNSA3LjUgMCAwIDEgMTUgMHYxIi8+PC8+LAogICAgdXNlcnM6IDw+PGNpcmNsZSBjeD0iOSIgY3k9IjgiIHI9IjMiLz48cGF0aCBkPSJNMyAyMHYtMS41YTYgNiAwIDAgMSAxMiAwVjIwTTE3IDExYTMgMyAwIDAgMCAwLTZNMTggMTRhNSA1IDAgMCAxIDMgNXYxIi8+PC8+LAogICAgbWFpbDogPD48cmVjdCB4PSIzIiB5PSI1IiB3aWR0aD0iMTgiIGhlaWdodD0iMTQiIHJ4PSIyIi8+PHBhdGggZD0ibTMgNyA5IDYgOS02Ii8+PC8+LAogICAgbG9jazogPD48cmVjdCB4PSI1IiB5PSIxMCIgd2lkdGg9IjE0IiBoZWlnaHQ9IjExIiByeD0iMiIvPjxwYXRoIGQ9Ik04IDEwVjdhNCA0IDAgMCAxIDggMHYzTTEyIDE0djMiLz48Lz4sCiAgICBpZDogPD48cmVjdCB4PSIyLjUiIHk9IjQuNSIgd2lkdGg9IjE5IiBoZWlnaHQ9IjE1IiByeD0iMiIvPjxjaXJjbGUgY3g9IjgiIGN5PSIxMCIgcj0iMiIvPjxwYXRoIGQ9Ik00LjkgMTZhMy41IDMuNSAwIDAgMSA2LjIgME0xNCAxMGg1TTE0IDE0aDUiLz48Lz4sCiAgICBwaW46IDw+PHBhdGggZD0iTTIwIDEwYzAgNS04IDExLTggMTFTNCAxNSA0IDEwYTggOCAwIDEgMSAxNiAwWiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjIuNSIvPjwvPiwKICAgIGNha2U6IDw+PHBhdGggZD0iTTQgMTFoMTZ2MTBINHpNNCAxNmMzIDIgNS0yIDggMHM1LTIgOCAwTTggN3Y0bTQtNHY0bTQtNHY0Ii8+PHBhdGggZD0iTTggNVYzbTQgMlYzbTQgMlYzIi8+PC8+LAogICAgY2FsZW5kYXI6IDw+PHJlY3QgeD0iMyIgeT0iNSIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE2IiByeD0iMiIvPjxwYXRoIGQ9Ik03IDN2NE0xNyAzdjRNMyAxMGgxOE04IDE0aDNNOCAxOGg2Ii8+PC8+LAogICAgY2xpcGJvYXJkOiA8PjxyZWN0IHg9IjUiIHk9IjQiIHdpZHRoPSIxNCIgaGVpZ2h0PSIxOCIgcng9IjIiLz48cmVjdCB4PSI5IiB5PSIyIiB3aWR0aD0iNiIgaGVpZ2h0PSI0IiByeD0iMSIvPjxwYXRoIGQ9Ik05IDEyaDZNOSAxNmg2Ii8+PC8+LAogICAgc2VhcmNoOiA8PjxjaXJjbGUgY3g9IjEwLjUiIGN5PSIxMC41IiByPSI2LjUiLz48cGF0aCBkPSJtMTYgMTYgNSA1Ii8+PC8+LAogICAgc3RldGhvc2NvcGU6IDw+PHBhdGggZD0iTTYgM3Y2YTYgNiAwIDAgMCAxMiAwVjNNNiAzSDR2NE0xOCAzaDJ2NE0xMiAxNXYyYTQgNCAwIDAgMCA4IDB2LTEiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjE0IiByPSIyIi8+PC8+LAogICAgc3lyaW5nZTogPD48cGF0aCBkPSJtNCAyMCA3LTdtLTItNiA4IDhtLTMtMTIgNyA3LTQgNC03LTd6TTMgMjFsMy0zbTgtMTIgMy0zIi8+PC8+LAogICAgcGlsbDogPD48cGF0aCBkPSJNMjAgNGE1IDUgMCAwIDEgMCA3bC05IDlhNSA1IDAgMCAxLTctN2w5LTlhNSA1IDAgMCAxIDcgMFpNOSA5bDYgNiIvPjwvPiwKICAgIGZpbGU6IDw+PHBhdGggZD0iTTYgM2g5bDQgNHYxM2ExIDEgMCAwIDEtMSAxSDZhMSAxIDAgMCAxLTEtMVY0YTEgMSAwIDAgMSAxLTF6TTE1IDN2NWg0TTggMTNoOE04IDE3aDYiLz48Lz4sCiAgICBzY2FsZTogPD48cGF0aCBkPSJNMTIgM3YxOE01IDdoMTRNNCA3bC0zIDZoNnpNMjAgN2wtMyA2aDZ6TTYgMjFoMTIiLz48Lz4sCiAgICBwYXc6IDw+PGVsbGlwc2UgY3g9IjciIGN5PSI4IiByeD0iMS41IiByeT0iMiIvPjxlbGxpcHNlIGN4PSIxMiIgY3k9IjUuNyIgcng9IjEuNSIgcnk9IjIiLz48ZWxsaXBzZSBjeD0iMTciIGN5PSI4IiByeD0iMS41IiByeT0iMiIvPjxlbGxpcHNlIGN4PSIyMCIgY3k9IjEyIiByeD0iMS4zIiByeT0iMS43Ii8+PHBhdGggZD0iTTkgMTNjMS40LTEuNiA0LjYtMS42IDYgMGwzIDMuM2MxLjcgMi0uMSA0LjQtMi40IDMuOC0yLjEtLjYtNS4xLS42LTcuMiAwLTIuMy42LTQuMS0xLjgtMi40LTMuOHoiLz48Lz4sCiAgICB3YXJuaW5nOiA8PjxwYXRoIGQ9Im0xMiAzIDEwIDE4SDJ6TTEyIDl2NU0xMiAxOGguMDEiLz48Lz4sCiAgICBub3RlczogPD48cmVjdCB4PSI0IiB5PSIzIiB3aWR0aD0iMTYiIGhlaWdodD0iMTgiIHJ4PSIyIi8+PHBhdGggZD0iTTggN2g4TTggMTFoOE04IDE1aDUiLz48Lz4sCiAgICBwZXREb2c6IDw+PHBhdGggZD0iTTcgOSA0IDZDMiA3IDIgMTIgNSAxNW0xMi02IDMtM2MyIDEgMiA2LTEgOU03IDljMS0zIDktMyAxMCAwbDIgNmMwIDUtMTQgNS0xNCAweiIvPjxwYXRoIGQ9Ik05IDEzaC4wMU0xNSAxM2guMDFtLTMgMnYyIi8+PC8+LAogICAgcGV0Q2F0OiA8PjxwYXRoIGQ9Ik01IDlWNGw1IDNoNGw1LTN2NWMyIDUgMSAxMS03IDExUzMgMTQgNSA5eiIvPjxwYXRoIGQ9Ik05IDEyaC4wMU0xNSAxMmguMDFtLTMgMyAxIDEtMSAxLTEtMXptLTggMCA0IDFtMTItMS00IDEiLz48Lz4sCiAgICBwZXRSYWJiaXQ6IDw+PHBhdGggZD0iTTggOUM1IDUgNiAyIDggMnM0IDUgNCA3YzAtMyAxLTcgMy03czMgNSAxIDgiLz48cGF0aCBkPSJNNiAxMGMtMyAzLTMgMTAgNiAxMHM5LTcgNi0xMGMtMy0zLTktMy0xMiAweiIvPjxwYXRoIGQ9Ik05IDE0aC4wMU0xNSAxNGguMDFtLTMgMiAxIDEtMSAxLTEtMXoiLz48Lz4sCiAgICBwZXRSZXB0aWxlOiA8PjxwYXRoIGQ9Ik0zIDE1YzMtNyA5LTExIDE0LTggNCAyIDEgOC0zIDhsLTMgNS0zLTQtNSAxIi8+PGNpcmNsZSBjeD0iMTUiIGN5PSI5IiByPSIuNzUiLz48cGF0aCBkPSJtOCAxMi00LTJtNyA0IDIgNSIvPjwvPiwKICAgIHBldEJpcmQ6IDw+PHBhdGggZD0iTTQgMTRjMi01IDYtOSAxMC05YTYgNiAwIDAgMSA1IDljLTIgMy00IDQtNyA1bC0yIDMtMi00QzUgMTggNCAxNiA0IDE0eiIvPjxwYXRoIGQ9Im0xOSAxMSA0IDEtNCAyTTkgMTFjMyAwIDQgMyA1IDQiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjkiIHI9Ii43Ii8+PC8+LAogIH07CiAgcmV0dXJuIDxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD17c2l6ZX0gaGVpZ2h0PXtzaXplfSB2aWV3Qm94PSIwIDAgMjQgMjQiIGFyaWEtaGlkZGVuPSJ0cnVlIiBjbGFzc05hbWU9e2B2bS12MjctaWNvbiAke2NsYXNzTmFtZX1gfSB7Li4uY29tbW9ufT57aWNvbnNbbmFtZV0gfHwgaWNvbnMucGF3fTwvc3ZnPjsKfQoKZXhwb3J0IGZ1bmN0aW9uIFZldE1hcFYyN1BldEljb24oeyBzcGVjaWVzID0gIiIgfSkgewogIGNvbnN0IHBldCA9IFN0cmluZyhzcGVjaWVzKS50b0xvd2VyQ2FzZSgpOwogIGNvbnN0IG5hbWUgPSAvY29uZWpvfHJhYmJpdC8udGVzdChwZXQpID8gInBldFJhYmJpdCIgOiAvZ2F0b3xjYXR8ZmVsaW5vLy50ZXN0KHBldCkgPyAicGV0Q2F0IiA6IC9wZXJyb3xkb2d8Y2FuaW5vLy50ZXN0KHBldCkgPyAicGV0RG9nIiA6IC9pZ3VhbmF8cmVwdGlsfGxhZ2FydG98Z2Vja298dG9ydHVnYS8udGVzdChwZXQpID8gInBldFJlcHRpbGUiIDogL2F2ZXxww6FqYXJvfHBhamFyb3xsb3JvfGNhbmFyaW98cG9sbG98cGF0by8udGVzdChwZXQpID8gInBldEJpcmQiIDogInBhdyI7CiAgcmV0dXJuIDxWZXRNYXBWMjdJY29uIG5hbWU9e25hbWV9IGNsYXNzTmFtZT0idm0tdjI3LXBldC1pY29uIiBzaXplPXs0M30vPjsKfQo="
CSS_DATA = "LyogVmV0TWFwIFYyNy4yMiAtIGljb25vcyBTVkcgY29uc2lzdGVudGVzIHBhcmEgZWwgY29udGVuaWRvIGludGVybm8gZGUgVmV0ZXJpbmFyaWEuCiAgIFNjb3BlIGV4Y2x1c2l2bzogcGFuZWwgY29uIG5hdiBkZSByb2wgdmV0LiBObyBhbHRlcmEgbG9zIGljb25vcyBwcmVtaXVtIGRlIGxvcyBiYW5uZXJzLiAqLwoudm0tbWVtYmVyLXNoZWxsLnZtaDE2LXNoZWxsOmhhcyg+IG5hdi52bS1tZW1iZXItbmF2LS12ZXQpIC52bS12MjctaWNvbiB7CiAgZGlzcGxheTogaW5saW5lLWJsb2NrOyBmbGV4OiAwIDAgYXV0bzsgdmVydGljYWwtYWxpZ246IG1pZGRsZTsgc3Ryb2tlLXdpZHRoOiAyOyBvdmVyZmxvdzogdmlzaWJsZTsKfQovKiBFc3RhZG9zIHZhY8Otb3M6IGNhbGVuZGFyaW8sIGLDunNxdWVkYSB5IGZpY2hhIGNsw61uaWNhLiAqLwpib2R5IC52bS1tZW1iZXItc2hlbGwudm1oMTYtc2hlbGw6aGFzKD4gbmF2LnZtLW1lbWJlci1uYXYtLXZldCkgLnZtLWNsaW5pYy1wYWdlIC52bS1jbGluaWMtZW1wdHkgPiBzcGFuLnZtLXYyNy1lbXB0eS1pY29uIHsKICBkaXNwbGF5OiBpbmxpbmUtZmxleCAhaW1wb3J0YW50OyBhbGlnbi1pdGVtczogY2VudGVyICFpbXBvcnRhbnQ7IGp1c3RpZnktY29udGVudDogY2VudGVyICFpbXBvcnRhbnQ7CiAgd2lkdGg6IDc2cHggIWltcG9ydGFudDsgaGVpZ2h0OiA3NnB4ICFpbXBvcnRhbnQ7IGJvcmRlci1yYWRpdXM6IDIycHggIWltcG9ydGFudDsKICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7IG1hcmdpbjogMCBhdXRvIDEwcHggIWltcG9ydGFudDsgZm9udC1zaXplOiAwICFpbXBvcnRhbnQ7IGxpbmUtaGVpZ2h0OiAxICFpbXBvcnRhbnQ7CiAgY29sb3I6ICMxMTdjOWUgIWltcG9ydGFudDsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE0MGRlZywjZTRmOGZmLCNjYWVmZjUpICFpbXBvcnRhbnQ7CiAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwuOCkgIWltcG9ydGFudDsgYm94LXNoYWRvdzogMCA4cHggMjBweCByZ2JhKDYsNzMsMTAwLC4wOCkgIWltcG9ydGFudDsKfQpib2R5IC52bS1tZW1iZXItc2hlbGwudm1oMTYtc2hlbGw6aGFzKD4gbmF2LnZtLW1lbWJlci1uYXYtLXZldCkgLnZtLWNsaW5pYy1lbXB0eSA+IHNwYW4udm0tdjI3LWVtcHR5LWljb24gPiBzdmcgewogIHdpZHRoOiAzOXB4ICFpbXBvcnRhbnQ7IGhlaWdodDogMzlweCAhaW1wb3J0YW50OyBzdHJva2U6IGN1cnJlbnRDb2xvciAhaW1wb3J0YW50OyBzdHJva2Utd2lkdGg6IDEuOCAhaW1wb3J0YW50Owp9Ci8qIEZvdG9zIHN1YmlkYXMgcG9yIGVsIGNsaWVudGUgTk8gc2UgYWx0ZXJhbjsgc29sbyBhdmF0YXJlcyBkZSByZXNwYWxkbyBjdWFuZG8gbm8gaGF5IGZvdG8uICovCmJvZHkgLnZtLW1lbWJlci1zaGVsbC52bWgxNi1zaGVsbDpoYXMoPiBuYXYudm0tbWVtYmVyLW5hdi0tdmV0KSAudm0tY2xpbmljLXBhdGllbnQtcGhvdG86aGFzKC52bS12MjctcGV0LWljb24pIHsKICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTQwZGVnLCNkOWY3ZjUsI2JkZTllZikgIWltcG9ydGFudDsKICBjb2xvcjogIzA4Njk3NyAhaW1wb3J0YW50OyBib3JkZXI6IDJweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LC44KSAhaW1wb3J0YW50Owp9CmJvZHkgLnZtLW1lbWJlci1zaGVsbC52bWgxNi1zaGVsbDpoYXMoPiBuYXYudm0tbWVtYmVyLW5hdi0tdmV0KSAudm0tY2xpbmljLXBhdGllbnQtcGhvdG8gLnZtLXYyNy1wZXQtaWNvbiB7CiAgZGlzcGxheTogYmxvY2sgIWltcG9ydGFudDsgd2lkdGg6IDQ2cHggIWltcG9ydGFudDsgaGVpZ2h0OiA0NnB4ICFpbXBvcnRhbnQ7CiAgbWFyZ2luOiBhdXRvICFpbXBvcnRhbnQ7IGNvbG9yOiAjMDg2OTc3ICFpbXBvcnRhbnQ7IHN0cm9rZS13aWR0aDogMS43NSAhaW1wb3J0YW50Owp9CmJvZHkgLnZtLW1lbWJlci1zaGVsbC52bWgxNi1zaGVsbDpoYXMoPiBuYXYudm0tbWVtYmVyLW5hdi0tdmV0KSAudm0tY2xpbmljLXBhdGllbnQtcGhvdG86aGFzKC52bS12MjctcGV0LWljb24pID4gc3BhbiB7CiAgZm9udC1zaXplOiAwICFpbXBvcnRhbnQ7IGRpc3BsYXk6ZmxleCAhaW1wb3J0YW50OyBhbGlnbi1pdGVtczpjZW50ZXIgIWltcG9ydGFudDsganVzdGlmeS1jb250ZW50OmNlbnRlciAhaW1wb3J0YW50Owp9Ci8qIEljb25vcyBwZXF1ZcOxb3MgZGVudHJvIGRlIGxhIGluZm9ybWFjacOzbiBkZWwgcGFjaWVudGUuICovCmJvZHkgLnZtLW1lbWJlci1zaGVsbC52bWgxNi1zaGVsbDpoYXMoPiBuYXYudm0tbWVtYmVyLW5hdi0tdmV0KSAudm0tY2xpbmljLXBhdGllbnQtZGF0YSA+IHNwYW4gLnZtLXYyNy1pbmxpbmUtaWNvbiwKYm9keSAudm0tbWVtYmVyLXNoZWxsLnZtaDE2LXNoZWxsOmhhcyg+IG5hdi52bS1tZW1iZXItbmF2LS12ZXQpIC52bS1jbGluaWMtZmlsZS1jaGlwcyAudm0tdjI3LWlubGluZS1pY29uLApib2R5IC52bS1tZW1iZXItc2hlbGwudm1oMTYtc2hlbGw6aGFzKD4gbmF2LnZtLW1lbWJlci1uYXYtLXZldCkgLnZtLWNsaW5pYy1pbmxpbmUtaGlzdG9yeS1jaGlwcyAudm0tdjI3LWlubGluZS1pY29uIHsKICB3aWR0aDogMTZweCAhaW1wb3J0YW50OyBoZWlnaHQ6IDE2cHggIWltcG9ydGFudDsgY29sb3I6ICMxMTk2OWYgIWltcG9ydGFudDsKICBtYXJnaW4tcmlnaHQ6IDVweCAhaW1wb3J0YW50OyB2ZXJ0aWNhbC1hbGlnbjogLTNweCAhaW1wb3J0YW50OyBzdHJva2Utd2lkdGg6IDIgIWltcG9ydGFudDsKfQovKiBMb3MgaW5kaWNhZG9yZXMgZGUgY29uc3VsdGFzLCBtZWRpY2FtZW50b3MsIHZhY3VuYXMgeSByZWNldGFzIHNpZ3VlbiB0ZW5pZW5kbyBzdXMgY2FudGlkYWRlcyByZWFsZXMuICovCmJvZHkgLnZtLW1lbWJlci1zaGVsbC52bWgxNi1zaGVsbDpoYXMoPiBuYXYudm0tbWVtYmVyLW5hdi0tdmV0KSAudm0tY2xpbmljLWZpbGUtc3RhdHMgc3Bhbi52bS12MjctbWluaS10aWxlLApib2R5IC52bS1tZW1iZXItc2hlbGwudm1oMTYtc2hlbGw6aGFzKD4gbmF2LnZtLW1lbWJlci1uYXYtLXZldCkgLnZtLWNsaW5pYy1maWxlLWluZm8tdGl0bGUgc3Bhbi52bS12MjctbWluaS10aWxlIHsKICBkaXNwbGF5OiBpbmxpbmUtZmxleCAhaW1wb3J0YW50OyBhbGlnbi1pdGVtczogY2VudGVyICFpbXBvcnRhbnQ7IGp1c3RpZnktY29udGVudDogY2VudGVyICFpbXBvcnRhbnQ7CiAgd2lkdGg6IDQwcHggIWltcG9ydGFudDsgaGVpZ2h0OiA0MHB4ICFpbXBvcnRhbnQ7IGJvcmRlci1yYWRpdXM6IDEycHggIWltcG9ydGFudDsKICBjb2xvcjogIzBjODBhMyAhaW1wb3J0YW50OyBiYWNrZ3JvdW5kOiAjZTNmNWZjICFpbXBvcnRhbnQ7IGZvbnQtc2l6ZTogMCAhaW1wb3J0YW50Owp9CmJvZHkgLnZtLW1lbWJlci1zaGVsbC52bWgxNi1zaGVsbDpoYXMoPiBuYXYudm0tbWVtYmVyLW5hdi0tdmV0KSAudm0tY2xpbmljLWZpbGUtc3RhdHMgc3Bhbi52bS12MjctbWluaS10aWxlIHN2ZywKYm9keSAudm0tbWVtYmVyLXNoZWxsLnZtaDE2LXNoZWxsOmhhcyg+IG5hdi52bS1tZW1iZXItbmF2LS12ZXQpIC52bS1jbGluaWMtZmlsZS1pbmZvLXRpdGxlIHNwYW4udm0tdjI3LW1pbmktdGlsZSBzdmcgewogIHdpZHRoOiAyMnB4ICFpbXBvcnRhbnQ7IGhlaWdodDogMjJweCAhaW1wb3J0YW50Owp9Ci8qIFRhcmpldGFzIGRlbCBwZXJmaWwgKDYgaWNvbm9zKTogdG9kb3MgZGVsIG1pc21vIHRhbWHDsW8geSBhY2FiYWRvLiAqLwpib2R5IC52bS1tZW1iZXItc2hlbGwudm1oMTYtc2hlbGw6aGFzKD4gbmF2LnZtLW1lbWJlci1uYXYtLXZldCkgLnZtLW15LXByb2ZpbGUtaGVhZGluZyAudm0tdjI3LXByb2ZpbGUtdGl0bGUtaWNvbiB7CiAgd2lkdGg6IDMycHggIWltcG9ydGFudDsgaGVpZ2h0OiAzMnB4ICFpbXBvcnRhbnQ7IGNvbG9yOiAjZWFmYWZmICFpbXBvcnRhbnQ7CiAgbWFyZ2luLXJpZ2h0OiA5cHggIWltcG9ydGFudDsgdmVydGljYWwtYWxpZ246IC00cHggIWltcG9ydGFudDsKfQpib2R5IC52bS1tZW1iZXItc2hlbGwudm1oMTYtc2hlbGw6aGFzKD4gbmF2LnZtLW1lbWJlci1uYXYtLXZldCkgLnZtLXByb2ZpbGUtc3VtbWFyeS1jYXJkID4gc3Bhbi52bS12MjctcHJvZmlsZS1iYWRnZSB7CiAgZGlzcGxheTogaW5saW5lLWZsZXggIWltcG9ydGFudDsgYWxpZ24taXRlbXM6IGNlbnRlciAhaW1wb3J0YW50OyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlciAhaW1wb3J0YW50OwogIHdpZHRoOiA0NHB4ICFpbXBvcnRhbnQ7IGhlaWdodDogNDRweCAhaW1wb3J0YW50OyBtaW4taGVpZ2h0OiA0NHB4ICFpbXBvcnRhbnQ7CiAgcGFkZGluZzogMCAhaW1wb3J0YW50OyBtYXJnaW46IDAgMCAxMHB4ICFpbXBvcnRhbnQ7CiAgYm9yZGVyLXJhZGl1czogMTNweCAhaW1wb3J0YW50OyBiYWNrZ3JvdW5kOiAjZGZmNGZhICFpbXBvcnRhbnQ7CiAgYm9yZGVyOiAxcHggc29saWQgI2QxZWFmMyAhaW1wb3J0YW50OyBjb2xvcjogIzBiNzE5MiAhaW1wb3J0YW50OwogIGZvbnQtc2l6ZTogMCAhaW1wb3J0YW50OyBib3gtc2hhZG93OiBub25lICFpbXBvcnRhbnQ7Cn0KYm9keSAudm0tbWVtYmVyLXNoZWxsLnZtaDE2LXNoZWxsOmhhcyg+IG5hdi52bS1tZW1iZXItbmF2LS12ZXQpIC52bS1wcm9maWxlLXN1bW1hcnktY2FyZCA+IHNwYW4udm0tdjI3LXByb2ZpbGUtYmFkZ2Ugc3ZnIHsKICB3aWR0aDogMjRweCAhaW1wb3J0YW50OyBoZWlnaHQ6IDI0cHggIWltcG9ydGFudDsgY29sb3I6IGluaGVyaXQgIWltcG9ydGFudDsKfQpib2R5IC52bS1tZW1iZXItc2hlbGwudm1oMTYtc2hlbGw6aGFzKD4gbmF2LnZtLW1lbWJlci1uYXYtLXZldCkgLnZtLXByb2ZpbGUtc3VtbWFyeS1jYXJkLnZtLXJvbGUtcmVhZG9ubHkgPiBzcGFuLnZtLXYyNy1wcm9maWxlLWJhZGdlIHsKICBiYWNrZ3JvdW5kOiAjZmZmMWRmICFpbXBvcnRhbnQ7IGJvcmRlci1jb2xvcjogI2Y2ZTVjOCAhaW1wb3J0YW50OyBjb2xvcjogI2EzNmIxNyAhaW1wb3J0YW50Owp9CkBtZWRpYShtYXgtd2lkdGg6NzAwcHgpewogIGJvZHkgLnZtLW1lbWJlci1zaGVsbC52bWgxNi1zaGVsbDpoYXMoPiBuYXYudm0tbWVtYmVyLW5hdi0tdmV0KSAudm0tY2xpbmljLWVtcHR5ID4gc3Bhbi52bS12MjctZW1wdHktaWNvbiB7IHdpZHRoOjYwcHggIWltcG9ydGFudDsgaGVpZ2h0OjYwcHggIWltcG9ydGFudDsgYm9yZGVyLXJhZGl1czoxN3B4ICFpbXBvcnRhbnQ7IH0KICBib2R5IC52bS1tZW1iZXItc2hlbGwudm1oMTYtc2hlbGw6aGFzKD4gbmF2LnZtLW1lbWJlci1uYXYtLXZldCkgLnZtLWNsaW5pYy1lbXB0eSA+IHNwYW4udm0tdjI3LWVtcHR5LWljb24gPiBzdmcgeyB3aWR0aDozMXB4ICFpbXBvcnRhbnQ7IGhlaWdodDozMXB4ICFpbXBvcnRhbnQ7IH0KfQo="
ROOT = Path(__file__).resolve().parent
MAIN = ROOT / 'web/src/main.jsx'
ICON = ROOT / 'web/src/components/VetMapV27Icons.jsx'
CSS = ROOT / 'web/src/vetmap_v27_22_iconos_veterinaria.css'
IMPORT_ICON = 'import VetMapV27Icon, { VetMapV27PetIcon } from "./components/VetMapV27Icons";'
IMPORT_CSS = 'import "./vetmap_v27_22_iconos_veterinaria.css";'
BACKUP_BASE = ROOT / 'respaldos_instaladores'
BACKUP_PREFIX = 'respaldo_antes_v27_22_'


def splice_region(src, start_key, end_key, transformer):
    start = src.find(start_key)
    if start < 0:
        raise RuntimeError(f"No encontré la sección de VetMap: {start_key}")
    end = src.find(end_key, start + len(start_key))
    if end < 0:
        raise RuntimeError(f"No encontré el límite seguro de: {start_key}")
    updated, counts = transformer(src[start:end])
    return src[:start] + updated + src[end:], counts


def match_replace(region, pat, replacement, key, counts, flags=0):
    new, count = re.subn(pat, replacement, region, flags=flags)
    counts[key] = counts.get(key, 0) + count
    return new


def new_empty(region, names, counts):
    for emoji, name in names.items():
        region = match_replace(
            region,
            r'<span>\s*' + re.escape(emoji) + r'\s*</span>',
            f'<span className="vm-v27-empty-icon"><VetMapV27Icon name="{name}" /></span>',
            'estados_vacios', counts
        )
    return region


def update_agenda(section):
    counts = {}
    section = new_empty(section, {'📅':'calendar', '🔎':'search'}, counts)
    # Etiquetas discretas en el pequeño resumen de la ficha que se abre desde Agenda.
    for emoji, name in {'🩺':'stethoscope','💉':'syringe','💊':'pill','📄':'file'}.items():
        pat = re.escape(emoji) + r'\{" "\}'
        section = match_replace(section, pat, f'<VetMapV27Icon name="{name}" className="vm-v27-inline-icon" />{{" "}}', 'chips_agenda', counts)
    return section, counts


def update_patients(section):
    counts = {}
    section = new_empty(section, {'🐾':'paw', '🔎':'search'}, counts)
    # Solo altera el icono sustituto si el paciente no tiene foto. Fotos: intactas.
    section = match_replace(section,
        r'\{\s*getPetEmoji\(patient\.species\)\s*\}',
        '<VetMapV27PetIcon species={patient.species} />', 'avatares_sin_foto', counts)
    section = match_replace(section, re.escape('👤 {patient.owner_name}'),
        '<VetMapV27Icon name="user" className="vm-v27-inline-icon" /> {patient.owner_name}', 'datos_paciente', counts)
    section = match_replace(section, re.escape('⚖️ {formatWeight(patient.weight)}'),
        '<VetMapV27Icon name="scale" className="vm-v27-inline-icon" /> {formatWeight(patient.weight)}', 'datos_paciente', counts)
    section = match_replace(section, re.escape('📅{" "}'),
        '<VetMapV27Icon name="calendar" className="vm-v27-inline-icon" />{" "}', 'datos_paciente', counts)
    return section, counts


def update_history(section):
    counts = {}
    section = new_empty(section, {'📋':'clipboard'}, counts)
    section = match_replace(section,
        r'\{\s*getPetEmoji\(\s*clinicPatientHistory\.pet\.species\s*\)\s*\}',
        '<VetMapV27PetIcon species={clinicPatientHistory.pet.species} />', 'ficha_sin_foto', counts)
    for e, name in [('🆔','id'),('🎂','cake'),('⚖️','scale')]:
        # En los chips aparecen antes de la información, no en texto libre.
        pat = re.escape(e) + r'(?=\s*(?:\{" "\}|#))'
        section = match_replace(section, pat,
            f'<VetMapV27Icon name="{name}" className="vm-v27-inline-icon" />', 'chips_ficha', counts)
    # Icono de la persona responsable, no se cambia ningún nombre de paciente.
    section = match_replace(section,
        r'(<div className="vm-clinic-file-owner-icon">)\s*👤\s*(</div>)',
        r'\1<VetMapV27Icon name="user" />\2', 'dueño_ficha', counts)
    # Iconos en las 4 tarjetas de estadísticas del historial.
    for emoji, name in [('🩺','stethoscope'),('💉','syringe'),('💊','pill'),('📄','file'),('🍽️','notes'),('📝','notes'),('📅','calendar')]:
        section = match_replace(section,
            r'<span>\s*' + re.escape(emoji) + r'\s*</span>',
            f'<span className="vm-v27-mini-tile"><VetMapV27Icon name="{name}" /></span>',
            'tarjetas_ficha', counts)
    # Algunas pestañas pequeñas contienen emoji dentro del título.
    for emoji, name in [('💊','pill'),('💉','syringe'),('📄','file'),('🩺','stethoscope')]:
        section = match_replace(section,
            r'(<span className="vm-admin-clinical-tab-emoji">)' + re.escape(emoji) + r'(</span>)',
            rf'\1<VetMapV27Icon name="{name}" />\2',
            'pestanas_ficha', counts)
    return section, counts


def update_profile(section):
    counts = {}
    # Perfil es compartido entre roles. Sólo la rama veterinaria recibe los SVG;
    # el resto sigue viendo exactamente los iconos anteriores.
    section = match_replace(section,
        re.escape('<h2>👤 Mi cuenta</h2>'),
        '<h2>{currentUser.role === "vet" ? <VetMapV27Icon name="user" className="vm-v27-profile-title-icon" /> : "👤"} Mi cuenta</h2>',
        'titulo_perfil', counts)
    for emoji, name in [('👤','user'),('✉️','mail'),('🔒','lock'),('🪪','id'),('🌎','pin'),('🎂','cake')]:
        section = match_replace(section,
            r'<span>\s*' + re.escape(emoji) + r'\s*</span>',
            '<span className={currentUser.role === "vet" ? "vm-v27-profile-badge" : undefined}>'+
                '{currentUser.role === "vet" ? <VetMapV27Icon name="'+name+'" /> : "'+emoji+'"}</span>',
            'tarjetas_perfil', counts)
    return section, counts


def modify_main(src):
    for necessary in [
        'memberSection === "clinicAgenda"',
        'memberSection === "clinicPatients"',
        'memberSection === "clinicHistory"',
        'className="vm-my-profile"',
        'const VETMAP_PET_SPECIES = [',
        'nav.vm-member-nav--',
    ]:
        # El nombre de clase del nav aparece de manera dinámica en main.jsx.
        if necessary == 'nav.vm-member-nav--':
            if 'vm-member-nav--${currentUser.role}' not in src and 'vm-member-nav--' not in src:
                raise RuntimeError('No pude identificar el menú del rol Veterinaria. No se cambió nada.')
            continue
        if necessary not in src:
            raise RuntimeError(f'Versión distinta: falta {necessary}. No se cambió nada.')
    report = {}
    for begin,end,transform in [
        ('memberSection === "clinicAgenda" && (','memberSection === "clinicPatients" && (',update_agenda),
        ('memberSection === "clinicPatients" && (','memberSection === "clinicHistory" && (',update_patients),
        ('memberSection === "clinicHistory" && (','memberSection === "clinicPrescriptions" && (',update_history),
    ]:
        # Algunos módulos intermedios pueden ir antes de Recetas; los modificadores
        # actúan sólo sobre los emojis y clases de Fichas identificados por nombre.
        src, found = splice_region(src, begin, end, transform)
        for k,v in found.items(): report[k] = report.get(k,0)+v
    profile = src.find('<section className="vm-my-profile">')
    if profile < 0: raise RuntimeError('No encontré el perfil. No se modificó nada.')
    # Sólo el encabezado y las seis tarjetas (antes del formulario de edición).
    form = src.find('className="vm-profile-edit-form"', profile)
    if form < 0: raise RuntimeError('No encontré el formulario del perfil. No se modificó nada.')
    changed, cnt = update_profile(src[profile:form])
    src = src[:profile]+changed+src[form:]
    for k,v in cnt.items(): report[k]=report.get(k,0)+v
    anchor = 'const VETMAP_PET_SPECIES = ['
    if IMPORT_ICON not in src:
        src=src.replace(anchor, IMPORT_ICON+'\n'+anchor,1)
        report['import_iconos']=1
    if IMPORT_CSS not in src:
        src=src.replace(anchor,IMPORT_CSS+'\n'+anchor,1)
        report['import_css']=1
    if src.count(IMPORT_ICON)!=1 or src.count(IMPORT_CSS)!=1:
        raise RuntimeError('Las importaciones quedaron duplicadas: se canceló la instalación.')
    return src,report


def backup(files):
    BACKUP_BASE.mkdir(parents=True, exist_ok=True)
    dest = BACKUP_BASE/(BACKUP_PREFIX+datetime.now().strftime('%Y%m%d_%H%M%S_%f'))
    dest.mkdir(parents=True,exist_ok=False)
    missing=[]
    for path in files:
        relative=path.relative_to(ROOT)
        output=dest/relative
        if path.exists():
            output.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(path,output)
        else:
            missing.append(str(relative).replace('\\','/'))
    (dest/'manifest.json').write_text(json.dumps({'missing':missing},ensure_ascii=False,indent=2),encoding='utf-8')
    return dest


def revert():
    if not BACKUP_BASE.exists():
        print('No hay respaldo de V27.22 para deshacer.')
        return
    items=sorted([x for x in BACKUP_BASE.glob(BACKUP_PREFIX+'*') if (x/'manifest.json').exists()],reverse=True)
    if not items:
        print('No hay un respaldo V27.22 para restaurar.')
        return
    source=items[0]
    manifest=json.loads((source/'manifest.json').read_text(encoding='utf-8'))
    for dest in [MAIN,ICON,CSS]:
        rel=dest.relative_to(ROOT)
        original=source/rel
        if original.exists():
            dest.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(original,dest)
        elif str(rel).replace('\\','/') in manifest['missing']:
            dest.unlink(missing_ok=True)
        else:
            raise RuntimeError('El respaldo está incompleto: '+str(rel))
    print('Cambios V27.22 revertidos desde:',source)
    print('Actualiza la web con Ctrl+F5.')


def main():
    if '--deshacer' in sys.argv:
        revert();return
    if not MAIN.exists() or not (ROOT/'web'/'package.json').exists():
        raise RuntimeError('Pon el instalador en la raíz de ProyectoVetMap, junto a backend, mobile y web.')
    original=MAIN.read_text(encoding='utf-8')
    changed,report=modify_main(original)
    icon_src=base64.b64decode(ICON_DATA).decode('utf-8')
    css_src=base64.b64decode(CSS_DATA).decode('utf-8')
    if ('VetMapV27Icon' not in icon_src or 'vm-v27-empty-icon' not in css_src
        or len(icon_src)<1400 or len(css_src)<1600):
        raise RuntimeError('Los recursos internos están incompletos. No se modificó nada.')
    if (changed==original and ICON.exists() and CSS.exists()
        and ICON.read_text(encoding='utf-8')==icon_src
        and CSS.read_text(encoding='utf-8')==css_src):
        print('VETMAP V27.22: YA INSTALADO. No se modificó nada.')
        return
    copy=backup([MAIN,ICON,CSS])
    try:
        ICON.parent.mkdir(parents=True,exist_ok=True)
        ICON.write_text(icon_src,encoding='utf-8')
        CSS.write_text(css_src,encoding='utf-8')
        MAIN.write_text(changed,encoding='utf-8')
    except Exception:
        shutil.copy2(copy/'web/src/main.jsx',MAIN)
        for path in [ICON,CSS]:
            f=copy/path.relative_to(ROOT)
            if f.exists(): shutil.copy2(f,path)
            else: path.unlink(missing_ok=True)
        raise
    print('\nVETMAP V27.22 — ICONOS VETERINARIA INSTALADOS')
    for k,v in sorted(report.items()):
        if v: print(' + ',k,':',v)
    print(' + Avatares sin foto, perfil y estados vacíos con iconos SVG modernos')
    print(' + Fotos subidas, funciones, otros roles y datos intactos')
    print(' Respaldo:',copy)
    print(' Reinicia la web si no se actualiza. Ctrl+F5.')
    print(' Para deshacer: python .\\instalar_iconos_veterinaria_v27_22.py --deshacer')

if __name__=='__main__':
    try: main()
    except Exception as exc:
        print('NO SE APLICÓ V27.22:',exc)
        sys.exit(1)
