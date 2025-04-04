"use client";
import { useState, useEffect } from "react";
import { Button, Box, Text, Icon } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";

const InstallButton = () => {
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    let deferredPrompt;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (navigator.userAgent.includes("Android")) {
        setShowInstallButton(true);
      }
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
    };

    const checkInstallation = () => {
      if (
        navigator.userAgent.includes("iPhone") ||
        navigator.userAgent.includes("iPad")
      ) {
        return window.navigator.standalone;
      }

      if (
        navigator.userAgent.includes("Android") &&
        "serviceWorker" in navigator
      ) {
        return navigator.serviceWorker.controller !== null;
      }

      return false;
    };

    if (!checkInstallation()) {
      setShowInstallButton(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    if (navigator.userAgent.includes("Android")) {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted the A2HS prompt");
          } else {
            console.log("User dismissed the A2HS prompt");
          }
          window.deferredPrompt = null;
        });
      }
    } else if (
      navigator.userAgent.includes("iPhone") ||
      navigator.userAgent.includes("iPad")
    ) {
      alert(
        "Para instalar esta aplicación, ábrela en Safari, toca el botón Compartir y selecciona «Agregar a inicio»."
      );
    }
  };

  if (!showInstallButton) return null;

  return (
    <Box
      className="fixed bottom-4 right-4 z-50"
      style={{
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "12px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-4 py-2"
        variant="ghost"
        colorScheme="blue"
        size="sm"
      >
        <DownloadIcon />
        <Text fontSize="sm" fontWeight="medium">
          Instalar App
        </Text>
      </Button>
    </Box>
  );
};

export default InstallButton;
