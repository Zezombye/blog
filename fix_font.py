#!/usr/bin/env python3
"""
Replace quote and apostrophe glyphs in a WOFF2 font file.
- Replaces U+0022 (quotation mark) glyph with U+201D (right double quotation mark) glyph
- Replaces U+0027 (apostrophe) glyph with U+2019 (right single quotation mark) glyph
"""

from fontTools.ttLib import TTFont
import os
import sys

def replace_glyphs(font_path, output_path=None):
    """
    Replace quote and apostrophe glyphs in a WOFF2 font.
    
    Args:
        font_path: Path to the input WOFF2 file
        output_path: Path for the output WOFF2 file (optional)
    """
    
    if output_path is None:
        base, ext = os.path.splitext(font_path)
        output_path = f"{base}-modified{ext}"
    
    print(f"Loading font: {font_path}")
    
    # Load the WOFF2 font
    font = TTFont(font_path)
    
    # Get the character map
    cmap = font.getBestCmap()
    if not cmap:
        print("Error: No character map found in font")
        return False
    
    # Check if required characters exist
    chars_to_check = {
        0x0022: "quotation mark (U+0022)",
        0x0027: "apostrophe (U+0027)", 
        0x201D: "right double quotation mark (U+201D)",
        0x2019: "right single quotation mark (U+2019)"
    }
    
    missing_chars = []
    for char_code, char_name in chars_to_check.items():
        if char_code not in cmap:
            missing_chars.append(char_name)
    
    if missing_chars:
        print(f"Error: Missing required characters: {', '.join(missing_chars)}")
        return False
    
    # Get glyph names
    quote_glyph = cmap[0x0022]  # "
    apos_glyph = cmap[0x0027]   # '
    right_dquote_glyph = cmap[0x201D]  # "
    right_squote_glyph = cmap[0x2019]  # '
    
    print(f"Found glyphs:")
    print(f"  Quote (U+0022): {quote_glyph}")
    print(f"  Apostrophe (U+0027): {apos_glyph}")
    print(f"  Right double quote (U+201D): {right_dquote_glyph}")
    print(f"  Right single quote (U+2019): {right_squote_glyph}")
    
    # Access the glyph set
    glyf = font['glyf'] if 'glyf' in font else None
    hmtx = font['hmtx'] if 'hmtx' in font else None
    
    if not glyf or not hmtx:
        print("Error: Font doesn't contain required tables (glyf/hmtx)")
        return False
    
    # Replace the glyph data
    print("Replacing glyph data...")
    
    # Replace quote glyph with right double quote glyph
    if quote_glyph in glyf and right_dquote_glyph in glyf:
        glyf[quote_glyph] = glyf[right_dquote_glyph]
        # Also copy metrics
        hmtx[quote_glyph] = hmtx[right_dquote_glyph]
        print(f"  Replaced {quote_glyph} with {right_dquote_glyph}")
    
    # Replace apostrophe glyph with right single quote glyph  
    if apos_glyph in glyf and right_squote_glyph in glyf:
        glyf[apos_glyph] = glyf[right_squote_glyph]
        # Also copy metrics
        hmtx[apos_glyph] = hmtx[right_squote_glyph]
        print(f"  Replaced {apos_glyph} with {right_squote_glyph}")
    
    # Handle GPOS kerning (modern OpenType kerning)
    if 'GPOS' in font:
        print("Updating GPOS kerning table...")
        gpos = font['GPOS']
        replacements_made = 0
        if hasattr(gpos.table, 'LookupList') and gpos.table.LookupList:
            print(f"Found {len(gpos.table.LookupList.Lookup)} lookups in GPOS")
            for lookup_index, lookup in enumerate(gpos.table.LookupList.Lookup):
                # Type 2 = Pair Adjustment (kerning)
                print(f"Processing lookup {lookup_index} of type {lookup.LookupType}")
                if lookup.LookupType == 2:
                    print(f"  Processing kerning lookup {lookup_index}")
                    
                    for subtable_index, subtable in enumerate(lookup.SubTable):
                        # Handle PairPos format 1 (individual pairs)
                        if hasattr(subtable, 'PairSet') and subtable.Format == 1:
                            if hasattr(subtable, 'Coverage') and subtable.Coverage:
                                # Replace glyph names in coverage
                                coverage_glyphs = subtable.Coverage.glyphs
                                for i, glyph in enumerate(coverage_glyphs):
                                    if glyph == right_dquote_glyph:
                                        coverage_glyphs[i] = quote_glyph
                                        replacements_made += 1
                                        print(f"    Replaced {right_dquote_glyph} -> {quote_glyph} in coverage")
                                    elif glyph == right_squote_glyph:
                                        coverage_glyphs[i] = apos_glyph
                                        replacements_made += 1
                                        print(f"    Replaced {right_squote_glyph} -> {apos_glyph} in coverage")
                                
                                # Replace glyph names in pair value records
                                for pair_set in subtable.PairSet:
                                    if pair_set:
                                        for pvr in pair_set.PairValueRecord:
                                            if pvr.SecondGlyph == right_dquote_glyph:
                                                pvr.SecondGlyph = quote_glyph
                                                replacements_made += 1
                                                print(f"    Replaced {right_dquote_glyph} -> {quote_glyph} in pair")
                                            elif pvr.SecondGlyph == right_squote_glyph:
                                                pvr.SecondGlyph = apos_glyph
                                                replacements_made += 1
                                                print(f"    Replaced {right_squote_glyph} -> {apos_glyph} in pair")
                        
                        # Handle PairPos format 2 (class-based kerning)
                        elif hasattr(subtable, 'Class1Count') and subtable.Format == 2:
                            # Replace in coverage
                            if hasattr(subtable, 'Coverage') and subtable.Coverage:
                                coverage_glyphs = subtable.Coverage.glyphs
                                for i, glyph in enumerate(coverage_glyphs):
                                    if glyph == right_dquote_glyph:
                                        coverage_glyphs[i] = quote_glyph
                                        replacements_made += 1
                                        print(f"    Replaced {right_dquote_glyph} -> {quote_glyph} in class coverage")
                                    elif glyph == right_squote_glyph:
                                        coverage_glyphs[i] = apos_glyph
                                        replacements_made += 1
                                        print(f"    Replaced {right_squote_glyph} -> {apos_glyph} in class coverage")
                            
                            # Replace in class definitions
                            if hasattr(subtable, 'ClassDef1') and subtable.ClassDef1:
                                class_def = subtable.ClassDef1.classDefs
                                if right_dquote_glyph in class_def:
                                    class_def[quote_glyph] = class_def.pop(right_dquote_glyph)
                                    replacements_made += 1
                                    print(f"    Moved {right_dquote_glyph} -> {quote_glyph} in ClassDef1")
                                if right_squote_glyph in class_def:
                                    class_def[apos_glyph] = class_def.pop(right_squote_glyph)
                                    replacements_made += 1
                                    print(f"    Moved {right_squote_glyph} -> {apos_glyph} in ClassDef1")
                            
                            if hasattr(subtable, 'ClassDef2') and subtable.ClassDef2:
                                class_def = subtable.ClassDef2.classDefs
                                if right_dquote_glyph in class_def:
                                    class_def[quote_glyph] = class_def.pop(right_dquote_glyph)
                                    replacements_made += 1
                                    print(f"    Moved {right_dquote_glyph} -> {quote_glyph} in ClassDef2")
                                if right_squote_glyph in class_def:
                                    class_def[apos_glyph] = class_def.pop(right_squote_glyph)
                                    replacements_made += 1
                                    print(f"    Moved {right_squote_glyph} -> {apos_glyph} in ClassDef2")
                
                # Handle other lookup types that might reference glyphs
                elif lookup.LookupType in [1, 3, 4, 5, 6, 7, 8]:  # Other GPOS lookup types
                    for subtable in lookup.SubTable:
                        if hasattr(subtable, 'Coverage') and subtable.Coverage:
                            coverage_glyphs = subtable.Coverage.glyphs
                            for i, glyph in enumerate(coverage_glyphs):
                                if glyph == right_dquote_glyph:
                                    coverage_glyphs[i] = quote_glyph
                                    replacements_made += 1
                                    print(f"    Replaced {right_dquote_glyph} -> {quote_glyph} in lookup type {lookup.LookupType}")
                                elif glyph == right_squote_glyph:
                                    coverage_glyphs[i] = apos_glyph
                                    replacements_made += 1
                                    print(f"    Replaced {right_squote_glyph} -> {apos_glyph} in lookup type {lookup.LookupType}")
                                    # Handle Extension Positioning (Type 9) - wrapper for other lookup types
                elif lookup.LookupType == 9:
                    print(f"  Processing extension lookup {lookup_index}")
                    for subtable in lookup.SubTable:
                        if hasattr(subtable, 'ExtensionLookupType') and hasattr(subtable, 'ExtSubTable'):
                            ext_lookup_type = subtable.ExtensionLookupType
                            ext_subtable = subtable.ExtSubTable
                            print(f"    Extension contains lookup type {ext_lookup_type}")
                            
                            # Handle the actual lookup type inside the extension
                            if ext_lookup_type == 2:  # Pair Adjustment (kerning)
                                # Handle PairPos format 1
                                if hasattr(ext_subtable, 'PairSet') and ext_subtable.Format == 1:
                                    if hasattr(ext_subtable, 'Coverage') and ext_subtable.Coverage:
                                        coverage_glyphs = ext_subtable.Coverage.glyphs
                                        for i, glyph in enumerate(coverage_glyphs):
                                            if glyph == right_dquote_glyph:
                                                coverage_glyphs[i] = quote_glyph
                                                replacements_made += 1
                                                print(f"      Replaced {right_dquote_glyph} -> {quote_glyph} in ext coverage")
                                            elif glyph == right_squote_glyph:
                                                coverage_glyphs[i] = apos_glyph
                                                replacements_made += 1
                                                print(f"      Replaced {right_squote_glyph} -> {apos_glyph} in ext coverage")
                                        
                                        for pair_set in ext_subtable.PairSet:
                                            if pair_set:
                                                for pvr in pair_set.PairValueRecord:
                                                    if pvr.SecondGlyph == right_dquote_glyph:
                                                        pvr.SecondGlyph = quote_glyph
                                                        replacements_made += 1
                                                        print(f"      Replaced {right_dquote_glyph} -> {quote_glyph} in ext pair")
                                                    elif pvr.SecondGlyph == right_squote_glyph:
                                                        pvr.SecondGlyph = apos_glyph
                                                        replacements_made += 1
                                                        print(f"      Replaced {right_squote_glyph} -> {apos_glyph} in ext pair")
                                
                                # Handle PairPos format 2
                                elif hasattr(ext_subtable, 'Class1Count') and ext_subtable.Format == 2:
                                    if hasattr(ext_subtable, 'Coverage') and ext_subtable.Coverage:
                                        coverage_glyphs = ext_subtable.Coverage.glyphs
                                        for i, glyph in enumerate(coverage_glyphs):
                                            if glyph == right_dquote_glyph:
                                                coverage_glyphs[i] = quote_glyph
                                                replacements_made += 1
                                                print(f"      Replaced {right_dquote_glyph} -> {quote_glyph} in ext class coverage")
                                            elif glyph == right_squote_glyph:
                                                coverage_glyphs[i] = apos_glyph
                                                replacements_made += 1
                                                print(f"      Replaced {right_squote_glyph} -> {apos_glyph} in ext class coverage")
                                    
                                    # Handle class definitions in extension
                                    if hasattr(ext_subtable, 'ClassDef1') and ext_subtable.ClassDef1:
                                        class_def = ext_subtable.ClassDef1.classDefs
                                        if right_dquote_glyph in class_def:
                                            class_def[quote_glyph] = class_def.pop(right_dquote_glyph)
                                            replacements_made += 1
                                            print(f"      Moved {right_dquote_glyph} -> {quote_glyph} in ext ClassDef1")
                                        if right_squote_glyph in class_def:
                                            class_def[apos_glyph] = class_def.pop(right_squote_glyph)
                                            replacements_made += 1
                                            print(f"      Moved {right_squote_glyph} -> {apos_glyph} in ext ClassDef1")
                                    
                                    if hasattr(ext_subtable, 'ClassDef2') and ext_subtable.ClassDef2:
                                        class_def = ext_subtable.ClassDef2.classDefs
                                        if right_dquote_glyph in class_def:
                                            class_def[quote_glyph] = class_def.pop(right_dquote_glyph)
                                            replacements_made += 1
                                            print(f"      Moved {right_dquote_glyph} -> {quote_glyph} in ext ClassDef2")
                                        if right_squote_glyph in class_def:
                                            class_def[apos_glyph] = class_def.pop(right_squote_glyph)
                                            replacements_made += 1
                                            print(f"      Moved {right_squote_glyph} -> {apos_glyph} in ext ClassDef2")
                            
                            # Handle other lookup types within extension
                            elif ext_lookup_type in [1, 3, 4, 5, 6, 7, 8]:
                                if hasattr(ext_subtable, 'Coverage') and ext_subtable.Coverage:
                                    coverage_glyphs = ext_subtable.Coverage.glyphs
                                    for i, glyph in enumerate(coverage_glyphs):
                                        if glyph == right_dquote_glyph:
                                            coverage_glyphs[i] = quote_glyph
                                            replacements_made += 1
                                            print(f"      Replaced {right_dquote_glyph} -> {quote_glyph} in ext type {ext_lookup_type}")
                                        elif glyph == right_squote_glyph:
                                            coverage_glyphs[i] = apos_glyph
                                            replacements_made += 1
                                            print(f"      Replaced {right_squote_glyph} -> {apos_glyph} in ext type {ext_lookup_type}")
                    

                        
    print(f"Saving modified font: {output_path}")
    
    # Save the modified font
    font.save(output_path)
    print("Font modification completed successfully!")
    
    return True

def main():
    input_file = "./articles/public/inter-italic-latin.woff2"
    
    if not os.path.exists(input_file):
        print(f"Error: Font file '{input_file}' not found")
        return
    
    try:
        success = replace_glyphs(input_file)
        if success:
            print(f"\nSuccess! Modified font saved as 'inter-roman-latin-modified.woff2'")
            print("The quote character (U+0022) now displays as U+201D")
            print("The apostrophe character (U+0027) now displays as U+2019")
        else:
            print("Font modification failed")
    
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
