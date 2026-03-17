!macro NSIS_HOOK_POSTUNINSTALL
  ; Only delete data when the user explicitly chose to delete app data
  ; and we're not running in update mode.
  ${If} $DeleteAppDataCheckboxState = 1
  ${AndIf} $UpdateMode <> 1
    SetShellVarContext current
    ; Custom app data directory (database)
    RmDir /r "$LOCALAPPDATA\\nodexlapp"
  ${EndIf}
!macroend
