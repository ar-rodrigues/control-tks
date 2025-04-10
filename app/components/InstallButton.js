"use client";
import { useState, useEffect } from "react";
import { Button, Box, Text } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show the install button only for Android
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

    // Initialize button visibility
    setShowInstallButton(!checkInstallation());

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
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("Usuario aceptó la instalación");
          } else {
            console.log("Usuario rechazó la instalación");
          }
          setDeferredPrompt(null);
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
      className="fixed z-50 bottom-4 right-4"
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
