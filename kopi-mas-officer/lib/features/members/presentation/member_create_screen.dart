import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:kopi_mas_officer/features/members/providers/members_provider.dart';
import 'package:kopi_mas_officer/features/members/models/member_model.dart';
import 'package:kopi_mas_officer/core/theme/app_theme.dart';

class MemberCreateScreen extends ConsumerStatefulWidget {
  const MemberCreateScreen({super.key});

  @override
  ConsumerState<MemberCreateScreen> createState() => _MemberCreateScreenState();
}

class _MemberCreateScreenState extends ConsumerState<MemberCreateScreen> {
  final _formKey = GlobalKey<FormState>();
  
  final _controllers = {
    'nik': TextEditingController(),
    'name': TextEditingController(),
    'phone': TextEditingController(),
    'address': TextEditingController(),
    'income': TextEditingController(),
    'email': TextEditingController(),
    'occupation': TextEditingController(),
  };

  bool _isLoading = false;

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    FocusManager.instance.primaryFocus?.unfocus();

    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      final member = MemberModel(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        nik: _controllers['nik']!.text.trim(),
        name: _controllers['name']!.text.trim(),
        phone: _controllers['phone']!.text.trim(),
        address: _controllers['address']!.text.trim(),
        income: double.parse(_controllers['income']!.text.replaceAll('.', '')),
        email: _controllers['email']!.text.trim().isEmpty ? null : _controllers['email']!.text.trim(),
        occupation: _controllers['occupation']!.text.trim().isEmpty ? null : _controllers['occupation']!.text.trim(),
      );

      final success = await ref.read(membersNotifierProvider.notifier).createMember(member);

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (success) {
        _showFeedbackSnackBar('Member registered successfully', false);
        context.go('/members');
      } else {
        _showFeedbackSnackBar('Failed to register member. Please try again.', true);
      }
    } else {
      _showFeedbackSnackBar('Please fix the errors in the form.', true);
    }
  }

  void _showFeedbackSnackBar(String message, bool isError) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(isError ? Icons.error_rounded : Icons.check_circle_rounded, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(child: Text(message, style: const TextStyle(fontWeight: FontWeight.w600))),
            ],
          ),
          backgroundColor: isError ? AppTheme.errorColor : AppTheme.successColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          margin: const EdgeInsets.all(20),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: AppTheme.surfaceColor,
      appBar: AppBar(
        title: const Text('Register Member'),
        scrolledUnderElevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 120),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colorScheme.primary.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: colorScheme.primary.withOpacity(0.15)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: colorScheme.primary, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Fill in the member details accurately. Fields marked with * are required.',
                        style: TextStyle(
                          fontSize: 13,
                          color: colorScheme.primary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              _FormSectionCard(
                title: 'Personal Identity',
                icon: Icons.badge_rounded,
                color: const Color(0xFF3B82F6),
                children: [
                  _BuildTextField(
                    controller: _controllers['nik']!,
                    label: 'NIK *',
                    hint: '16 digit ID number',
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    maxLength: 16,
                    validator: (v) => (v?.length != 16) ? 'Must be exactly 16 digits' : null,
                  ),
                  const SizedBox(height: 16),
                  _BuildTextField(
                    controller: _controllers['name']!,
                    label: 'Full Name *',
                    textCapitalization: TextCapitalization.words,
                    validator: (v) => (v?.isEmpty ?? true) ? 'Name is required' : null,
                  ),
                ],
              ),
              
              const SizedBox(height: 16),

              _FormSectionCard(
                title: 'Contact Information',
                icon: Icons.contact_mail_rounded,
                color: const Color(0xFF10B981),
                children: [
                  _BuildTextField(
                    controller: _controllers['phone']!,
                    label: 'Phone Number *',
                    keyboardType: TextInputType.phone,
                    validator: (v) => (v?.isEmpty ?? true) ? 'Phone is required' : null,
                  ),
                  const SizedBox(height: 16),
                  _BuildTextField(
                    controller: _controllers['email']!,
                    label: 'Email Address (Optional)',
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 16),
                  _BuildTextField(
                    controller: _controllers['address']!,
                    label: 'Full Address *',
                    textCapitalization: TextCapitalization.sentences,
                    maxLines: 3,
                    validator: (v) => (v?.isEmpty ?? true) ? 'Address is required' : null,
                  ),
                ],
              ),

              const SizedBox(height: 16),

              _FormSectionCard(
                title: 'Financial Details',
                icon: Icons.account_balance_wallet_rounded,
                color: const Color(0xFFF59E0B),
                children: [
                  _BuildTextField(
                    controller: _controllers['occupation']!,
                    label: 'Occupation (Optional)',
                    textCapitalization: TextCapitalization.words,
                  ),
                  const SizedBox(height: 16),
                  _BuildTextField(
                    controller: _controllers['income']!,
                    label: 'Monthly Income (Rp) *',
                    keyboardType: TextInputType.number,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => _handleSubmit(),
                    validator: (v) {
                      if (v?.isEmpty ?? true) return 'Income is required';
                      if (double.tryParse(v!.replaceAll('.', '')) == null) return 'Invalid amount';
                      return null;
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey.shade200)),
        ),
        child: SafeArea(
          child: SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _isLoading ? null : _handleSubmit,
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 18),
              ),
              child: _isLoading
                  ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))
                  : const Text('Complete Registration'),
            ),
          ),
        ),
      ),
    );
  }
}

class _FormSectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color color;
  final List<Widget> children;

  const _FormSectionCard({
    required this.title,
    required this.icon,
    required this.color,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: AppTheme.elevatedCardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 16),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          ...children,
        ],
      ),
    );
  }
}

class _BuildTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final int? maxLength;
  final int maxLines;
  final TextCapitalization textCapitalization;
  final String? Function(String?)? validator;
  final TextInputAction textInputAction;
  final void Function(String)? onSubmitted;

  const _BuildTextField({
    required this.controller,
    required this.label,
    this.hint,
    this.keyboardType,
    this.inputFormatters,
    this.maxLength,
    this.maxLines = 1,
    this.textCapitalization = TextCapitalization.none,
    this.validator,
    this.textInputAction = TextInputAction.next,
    this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      maxLength: maxLength,
      maxLines: maxLines,
      textCapitalization: textCapitalization,
      validator: validator,
      textInputAction: textInputAction,
      onFieldSubmitted: onSubmitted,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        counterText: '',
      ),
    );
  }
}