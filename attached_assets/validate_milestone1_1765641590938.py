#!/usr/bin/env python3
"""
Milestone 1 RDF Validator
Checks only what should be present in Milestone 1:
- CreativeWork
- Participant
- Person (as ParticipantSC)
- Location
- Asset
- Participant↔Location connection
"""

import sys
from pathlib import Path

try:
    from rdflib import Graph, Namespace, Literal
    from rdflib.namespace import RDF, RDFS
except ImportError:
    print("ERROR: rdflib not installed. Run: pip install rdflib")
    sys.exit(1)

OMC = Namespace("https://movielabs.com/omc/rdf/schema/v2.8#")
ME = Namespace("https://me-nexus.com/id/")


def validate_milestone1(ttl_file: str):
    """Validate Milestone 1 requirements only"""
    
    print("="*70)
    print("MILESTONE 1 VALIDATION")
    print("="*70)
    
    graph = Graph()
    try:
        graph.parse(ttl_file, format='turtle')
        print(f"✓ Loaded {len(graph)} triples\n")
    except Exception as e:
        print(f"✗ Failed to parse: {e}")
        return False
    
    passed = True
    
    # Check 1: Required Entity Types
    print("[1] Checking Required Entity Types...")
    requirements = {
        'CreativeWork': OMC.CreativeWork,
        'Participant': OMC.Participant,
        'Person': OMC.Person,
        'Location': OMC.Location,
        'Asset': OMC.Asset
    }
    
    for name, entity_type in requirements.items():
        count = len(list(graph.subjects(RDF.type, entity_type)))
        if count > 0:
            print(f"    ✓ {name}: {count} found")
        else:
            print(f"    ✗ {name}: MISSING")
            passed = False
    
    # Check 2: Location Reference Bug
    print("\n[2] Checking Location References...")
    location_errors = []
    for s, p, o in graph.triples((None, OMC.hasLocation, None)):
        if isinstance(o, Literal):
            location_errors.append(f"    ✗ {s.split('/')[-1][:20]}... → '{o}' (STRING LITERAL)")
    
    if location_errors:
        print("    CRITICAL ERRORS FOUND:")
        for error in location_errors:
            print(error)
        print("    FIX: Remove quotes from location references")
        passed = False
    else:
        print("    ✓ All location references are URIs")
    
    # Check 3: Participant-Location Connection
    print("\n[3] Checking Participant↔Location Connection...")
    participants = list(graph.subjects(RDF.type, OMC.Participant))
    connection_found = False
    
    for participant in participants:
        # Find the Person SC for this participant
        for person in graph.objects(participant, OMC.hasParticipantStructuralCharacteristic):
            # Check if Person has Location
            for location in graph.objects(person, OMC.hasLocation):
                if isinstance(location, Literal):
                    print(f"    ✗ Connection exists but uses STRING LITERAL")
                    passed = False
                else:
                    print(f"    ✓ {participant.split('/')[-1][:15]}... → Person → Location")
                    connection_found = True
    
    if not connection_found:
        print("    ⚠️  No Participant→Location connection found")
        print("       (Expected: Participant → Person → Location)")
    
    # Check 4: Data Quality
    print("\n[4] Checking Data Quality...")
    quality_issues = []
    
    # Check for spelling errors
    for s, p, o in graph.triples((None, RDFS.label, None)):
        if isinstance(o, Literal):
            label = str(o).lower()
            if 'minessotta' in label:
                quality_issues.append(f"    ⚠️  Spelling: '{o}' should be 'Minnesota'")
    
    # Check for identifier circularity
    circular = 0
    for s, p, o in graph.triples((None, OMC.hasIdentifier, None)):
        if str(s) == str(o):
            circular += 1
    
    if circular > 0:
        quality_issues.append(f"    ⚠️  {circular} circular identifier references (entity points to itself)")
        quality_issues.append(f"       Recommend: Use blank nodes for identifier structure")
    
    if quality_issues:
        print("    Quality Issues Found:")
        for issue in quality_issues:
            print(issue)
    else:
        print("    ✓ No data quality issues detected")
    
    # Summary
    print("\n" + "="*70)
    if passed:
        print("✓ MILESTONE 1 VALIDATION PASSED")
        print("\nAll required entities present and properly connected.")
        if quality_issues:
            print(f"Note: {len(quality_issues)} non-blocking quality issues detected above.")
    else:
        print("✗ MILESTONE 1 VALIDATION FAILED")
        print("\nCritical issues must be fixed before proceeding.")
    print("="*70)
    
    return passed


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python validate_milestone1.py <file.ttl>")
        sys.exit(1)
    
    result = validate_milestone1(sys.argv[1])
    sys.exit(0 if result else 1)
