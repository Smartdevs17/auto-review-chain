import React, { useState } from "react";
import { Button } from "./ui/button";
import { Wallet, Menu, X, LogOut, CheckCircle, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, walletAddress, connectWallet, disconnectWallet, isBlockchainRegistered } = useWallet();
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/submit", label: "Submit Paper" },
    { href: "/reviews", label: "Reviews" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center glow">
              <span className="text-lg font-bold">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PeerAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Wallet Connect Button */}
          <div className="hidden md:block">
            {isConnected ? (
              <div className="flex items-center gap-2">
                {/* Blockchain Registration Status */}
                {isBlockchainRegistered === false && (
                  <div className="flex items-center gap-1 text-warning text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Not Registered</span>
                  </div>
                )}
                {isBlockchainRegistered === true && (
                  <div className="flex items-center gap-1 text-success text-xs">
                    <CheckCircle className="w-3 h-3" />
                    <span>Registered</span>
                  </div>
                )}
                
                <span className="text-sm text-muted-foreground font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <Button variant="outline" size="sm" onClick={disconnectWallet} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button variant="hero" className="gap-2" onClick={connectWallet}>
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isConnected ? (
                <div className="space-y-2">
                  {/* Blockchain Registration Status */}
                  {isBlockchainRegistered === false && (
                    <div className="flex items-center justify-center gap-1 text-warning text-xs">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Not Registered on Blockchain</span>
                    </div>
                  )}
                  {isBlockchainRegistered === true && (
                    <div className="flex items-center justify-center gap-1 text-success text-xs">
                      <CheckCircle className="w-3 h-3" />
                      <span>Blockchain Registered</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground font-mono text-center">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </div>
                  <Button variant="outline" size="sm" onClick={disconnectWallet} className="gap-2 w-full">
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button variant="hero" className="gap-2 w-full" onClick={connectWallet}>
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
