"""Regression coverage for the Windows one-time setup script."""

from pathlib import Path
import unittest


SCRIPT = Path(__file__).parents[1] / "scripts" / "setup_local_windows.ps1"
LAUNCHER = Path(__file__).parents[2] / "frontend" / "scripts" / "start-obd-expert.ps1"


class SetupLocalWindowsTests(unittest.TestCase):
    def test_env_acl_does_not_depend_on_powershell_security_module(self) -> None:
        """Minimal Windows PowerShell installs may be unable to import Get-Acl."""
        source = SCRIPT.read_text(encoding="utf-8")

        self.assertNotIn("Get-Acl", source)
        self.assertNotIn("Set-Acl", source)
        self.assertNotIn("icacls.exe", source)
        self.assertIn(
            "New-Object System.Security.AccessControl.FileSecurity", source
        )
        self.assertIn("[System.IO.File]::SetAccessControl", source)
        self.assertIn(".User.Value", source)
        self.assertIn('[Environment]::GetFolderPath("LocalApplicationData")', source)
        self.assertNotIn('Join-Path $v3Root ".env"', source)
        self.assertIn('$env:PYTHONUTF8 = "1"', source)

    def test_launcher_loads_user_scoped_v3_environment(self) -> None:
        source = LAUNCHER.read_text(encoding="utf-8")

        self.assertIn('[Environment]::GetFolderPath("LocalApplicationData")', source)
        self.assertIn("SetEnvironmentVariable", source)
        self.assertNotIn('Join-Path $v3Root ".env"', source)


if __name__ == "__main__":
    unittest.main()
